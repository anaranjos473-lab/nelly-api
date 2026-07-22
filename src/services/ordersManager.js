import {
  canTransition,
  explainTransition as explainOrderStateTransition,
  normalizeState as normalizeDomainState
} from '../domain/stateMachine.js';

const NORMALIZED_STATES = {
  PENDIENTE: 'PENDIENTE',
  LISTO: 'LISTO',
  EN_CURSO: 'EN_CURSO',
  ENTREGADO: 'ENTREGADO'
};

const ESTADOS_DISPONIBLES = new Set([
  'LISTO',
  'PENDIENTE_ACEPTACION',
  'LISTO_PARA_REPARTO',
  'ESPERANDO_REPARTIDOR',
  'DESPACHO'
]);

const ESTADOS_EN_CURSO = new Set([
  'EN_CAMINO',
  'EN_CURSO',
  'EN_REPARTO',
  'REPARTO',
  'LLEGUE_A_TIENDA',
  'PEDIDO_ABORDO',
  'LLEGUE_A_CLIENTE'
]);

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function normalizeOrderState(value) {
  return normalizeDomainState(value);
}

function getOrderIdentity(order = {}) {
  return String(
    order.id_pedido
      || order.id
      || order.pedido_id
      || ''
  ).trim();
}

function estadoOperativo(estado) {
  const normalized = normalizeOrderState(estado);
  if (ESTADOS_DISPONIBLES.has(normalized)) {
    return 'LISTO';
  }
  if (ESTADOS_EN_CURSO.has(normalized)) {
    return 'EN_CURSO';
  }
  if (normalized === 'FINALIZADO') {
    return 'ENTREGADO';
  }
  return normalized;
}

function obtenerPrioridadEstado(estado) {
  const normalized = normalizeOrderState(estado);
  const ranking = {
    PENDIENTE: 0,
    LISTO: 1,
    EN_CURSO: 2,
    LLEGUE_A_TIENDA: 3,
    PEDIDO_ABORDO: 4,
    LLEGUE_A_CLIENTE: 5,
    ENTREGADO: 6
  };
  return ranking[normalized] ?? 2;
}

function esTransicionOperativaPermitida(actual, siguiente) {
  return canTransition(actual, siguiente);
}

function shouldAdvancePedidoState(currentState, incomingState) {
  const current = currentState || '';
  const incoming = incomingState || '';
  if (!incoming) {
    return false;
  }
  const currentPriority = obtenerPrioridadEstado(current);
  const incomingPriority = obtenerPrioridadEstado(incoming);
  if (incomingPriority === currentPriority) {
    return true;
  }
  return incomingPriority > currentPriority;
}

function getOrderTotal(order = {}) {
  const total = Number(
    order.monto_total
      ?? order.monto
      ?? order.total
      ?? order.total_pedido
      ?? 0
  );
  return Number.isFinite(total) ? total : 0;
}

function firstPositiveMoney(...values) {
  for (const value of values) {
    const amount = Number(value);
    if (Number.isFinite(amount) && amount > 0) {
      return roundMoney(amount);
    }
  }
  return 0;
}

function getDeliveryPayout(order = {}) {
  return firstPositiveMoney(
    order.ganancia_neta,
    order.ganancia,
    order.tarifa_entrega,
    order.costo_envio,
    order.costoEnvio,
    order.envio,
    order.shipping,
    order.delivery_fee
  );
}

function getDriverUidFromOrder(order = {}) {
  return order.repartidor_id || order.conductorId || order.driverUid || order.uid_repartidor || null;
}

function isDebtBlocked(driver) {
  const bloqueado = driver?.estatus?.bloqueado_por_deuda === true
    || driver?.perfil?.bloqueado_por_deuda === true;
  const deuda = Number(driver?.finanzas?.deuda_actual ?? driver?.billetera?.deuda_comision ?? 0);
  const limite = Number(driver?.finanzas?.limite_deuda || 0);
  return bloqueado || (limite > 0 && deuda > limite);
}

function canAcceptOrder({ driver, order, uid }) {
  if (isDebtBlocked(driver)) {
    return { ok: false, error: 'Limite de deuda alcanzado', status: 403 };
  }

  if (!order) {
    return { ok: false, error: 'Pedido no disponible', status: 404 };
  }

  if (order.repartidor_id && order.repartidor_id !== uid) {
    return { ok: false, error: 'El pedido ya fue tomado por otro repartidor', status: 409 };
  }

  const estadoActual = estadoOperativo(order.estado_pedido || order.estado);
  if (estadoActual !== 'LISTO') {
    return { ok: false, error: 'Transicion invalida: el pedido no esta listo para reparto', status: 409, estadoActual };
  }

  return { ok: true, estadoActual };
}

function buildDriverAcceptanceContext({ driver = {}, order = {}, uid } = {}) {
  return {
    uid: uid || null,
    driver: { ...driver },
    order: { ...order },
    decision: canAcceptOrder({ driver, order, uid })
  };
}

function buildDriverCompletionContext({
  order = {},
  uid,
  isPanel = false,
  completionType = 'normal',
  comisionSolicitada = 0,
  comisionFallback = 0,
  tarifaEntregaFallback = 0
} = {}) {
  const decision = canCompleteOrder({ order, uid, isPanel });
  const montoPedido = getOrderTotal(order);
  const comision = firstPositiveMoney(comisionSolicitada, comisionFallback);
  const tarifaEntrega = firstPositiveMoney(tarifaEntregaFallback);
  return {
    uid: uid || null,
    order: { ...order },
    isPanel: Boolean(isPanel),
    completionType,
    decision,
    montoPedido,
    comision,
    tarifaEntrega
  };
}

function buildAcceptedOrderPayload(order = {}, uid, acceptedAt = Date.now()) {
  return {
    ...order,
    id_pedido: order.id_pedido || order.id || order.pedido_id,
    repartidor_id: uid,
    conductorId: uid,
    estado: 'EN_CURSO',
    estado_pedido: 'EN_CURSO',
    logistica: {
      ...(order.logistica || {}),
      estado: 'EN_CURSO',
      repartidor_id: uid,
      repartidor_uid: uid,
      asignacion_activa: true
    },
    aceptado_en: acceptedAt
  };
}

function canCompleteOrder({ order, uid, isPanel = false }) {
  if (!order) {
    return { ok: false, error: 'Pedido no encontrado', status: 404 };
  }

  const estadoActual = estadoOperativo(order.estado_pedido || order.estado);
  const alreadyCompleted = estadoActual === 'ENTREGADO';
  if (!alreadyCompleted && estadoActual && !ESTADOS_EN_CURSO.has(estadoActual)) {
    return { ok: false, error: 'Transicion invalida: el pedido aun no esta en reparto', status: 409, estadoActual };
  }

  if (!isPanel) {
    const driverUid = getDriverUidFromOrder(order);
    if (!driverUid || driverUid !== uid) {
      return { ok: false, error: 'Solo el repartidor asignado puede completar este pedido', status: 403 };
    }
  }

  return { ok: true, estadoActual, alreadyCompleted };
}

function buildCompletedOrderPayload(order = {}, completedAt = Date.now(), completionType = 'normal', comision = 0, tarifaEntrega = 0) {
  const pedidoUpdates = {
    estado: 'ENTREGADO',
    estado_pedido: 'ENTREGADO',
    logistica: {
      ...(order.logistica || {}),
      estado: 'ENTREGADO',
      fase_operativa: null,
      asignacion_activa: false
    },
    entregado_en: order.entregado_en || completedAt,
    finalizado_at: order.finalizado_at || completedAt,
    timestampActualizacion: completedAt
  };

  pedidoUpdates.completion_type = completionType === 'customer_absent' ? 'customer_absent' : 'normal';
  pedidoUpdates.motivo_cierre = pedidoUpdates.completion_type === 'customer_absent'
    ? 'cliente_ausente'
    : 'entrega_normal';
  if (comision > 0) {
    pedidoUpdates.ganancia_neta = comision;
  }
  if (tarifaEntrega > 0) {
    pedidoUpdates.tarifa_entrega = tarifaEntrega;
  }

  return pedidoUpdates;
}

function buildDriverOfflinePayload(uid, timestamp = Date.now()) {
  return {
    [`conductores_activos/${uid}`]: null,
    [`repartidores/${uid}/disponible`]: false,
    [`repartidores/${uid}/estado`]: 'OFFLINE',
    [`repartidores/${uid}/ultima_conexion`]: timestamp,
    [`repartidores/${uid}/offline_en`]: timestamp
  };
}

function buildDriverOnlinePayload(uid, activePedidoId, timestamp = Date.now()) {
  const updates = {
    [`repartidores/${uid}/disponible`]: true,
    [`repartidores/${uid}/estado`]: 'DISPONIBLE',
    [`repartidores/${uid}/ultima_conexion`]: timestamp,
    [`repartidores_activos/${uid}/estado`]: 'DISPONIBLE',
    [`repartidores_activos/${uid}/disponible`]: true,
    [`repartidores_activos/${uid}/uid`]: uid,
    [`repartidores_activos/${uid}/actualizado_en`]: timestamp
  };

  if (!activePedidoId) {
    updates[`repartidores/${uid}/pedido_activo`] = null;
  }

  return updates;
}

function limpiarAsignacionParaPool(order = {}) {
  const limpio = { ...order };
  const camposAsignacion = [
    'conductorId',
    'idConductor',
    'repartidor_id',
    'driverUid',
    'uid_repartidor',
    'driverId',
    'assignedDriver',
    'assignedTo',
    'deliveryDriver'
  ];
  for (const key of camposAsignacion) {
    limpio[key] = null;
  }
  const logistica = { ...(limpio.logistica || {}) };
  for (const key of camposAsignacion) {
    logistica[key] = null;
  }
  limpio.logistica = logistica;
  return limpio;
}

function getOrderState(order = {}) {
  return normalizeOrderState(order.estado_pedido || order.estado);
}

function buildOrderContext(order = {}, meta = {}) {
  return {
    pedidoId: String(meta.pedidoId || getOrderIdentity(order)).trim(),
    currentState: getOrderState(order),
    order: { ...order },
    meta: { ...meta }
  };
}

function isOrdersManagerReady() {
  return true;
}

function createOrdersManager(dependencies = {}) {
  return {
    dependencies: { ...dependencies },
    normalizeOrderState,
    getOrderState,
    buildOrderContext,
    isOrdersManagerReady
  };
}

const ordersManagerApi = {
  NORMALIZED_STATES,
  ESTADOS_DISPONIBLES,
  ESTADOS_EN_CURSO,
  roundMoney,
  normalizeOrderState,
  getOrderIdentity,
  estadoOperativo,
  obtenerPrioridadEstado,
  esTransicionOperativaPermitida,
  shouldAdvancePedidoState,
  getOrderTotal,
  firstPositiveMoney,
  getDeliveryPayout,
  getDriverUidFromOrder,
  isDebtBlocked,
  canAcceptOrder,
  buildDriverAcceptanceContext,
  buildDriverCompletionContext,
  buildAcceptedOrderPayload,
  canCompleteOrder,
  buildCompletedOrderPayload,
  buildDriverOfflinePayload,
  buildDriverOnlinePayload,
  limpiarAsignacionParaPool,
  getOrderState,
  buildOrderContext,
  isOrdersManagerReady,
  createOrdersManager
};

export {
  NORMALIZED_STATES,
  ESTADOS_DISPONIBLES,
  ESTADOS_EN_CURSO,
  roundMoney,
  normalizeOrderState,
  getOrderIdentity,
  estadoOperativo,
  obtenerPrioridadEstado,
  esTransicionOperativaPermitida,
  explainOrderStateTransition,
  shouldAdvancePedidoState,
  getOrderTotal,
  firstPositiveMoney,
  getDeliveryPayout,
  getDriverUidFromOrder,
  isDebtBlocked,
  canAcceptOrder,
  buildDriverAcceptanceContext,
  buildDriverCompletionContext,
  buildAcceptedOrderPayload,
  canCompleteOrder,
  buildCompletedOrderPayload,
  buildDriverOfflinePayload,
  buildDriverOnlinePayload,
  limpiarAsignacionParaPool,
  getOrderState,
  buildOrderContext,
  isOrdersManagerReady,
  createOrdersManager
};

export { ordersManagerApi };

export default createOrdersManager;
