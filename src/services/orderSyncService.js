import { limpiarAsignacionParaPool, normalizeOrderState, shouldAdvancePedidoState } from './ordersManager.js';

function buildDispatchSyncWrites(pedidoId, order, dispatchedPayload) {
  return {
    [`pedidos/${pedidoId}`]: dispatchedPayload,
    [`pedidos_para_reparto/${pedidoId}`]: dispatchedPayload
  };
}

function buildAcceptSyncWrites(pedidoId, uid, acceptedPayload) {
  return {
    [`pedidos/${pedidoId}`]: acceptedPayload,
    [`repartidores/${uid}/pedido_activo`]: pedidoId,
    [`pedidos_para_reparto/${pedidoId}`]: null,
    [`pedidos_en_camino/${pedidoId}`]: acceptedPayload
  };
}

function buildTransitionSyncWrites(pedidoId, state, order) {
  const estadoSiguiente = normalizeOrderState(state);
  const updatedAt = Date.now();
  const pedidoEnCamino = { ...order, estado: estadoSiguiente, estado_pedido: estadoSiguiente, timestampActualizacion: updatedAt };
  return {
    [`pedidos/${pedidoId}/estado`]: estadoSiguiente,
    [`pedidos/${pedidoId}/estado_pedido`]: estadoSiguiente,
    [`pedidos/${pedidoId}/logistica/estado`]: estadoSiguiente,
    [`pedidos/${pedidoId}/timestampActualizacion`]: updatedAt,
    [`pedidos_en_camino/${pedidoId}`]: pedidoEnCamino
  };
}

function buildLocationSyncWrites({ uid, pedidoId = null, lat, lng, timestamp = Date.now(), fasePanel = null, currentOrder = null, stateHint = null }) {
  const ubicacion = { lat, lng, timestamp, pedidoId: pedidoId || null };
  const updates = {
    [`repartidores/${uid}/ubicacion`]: ubicacion,
    [`repartidores/${uid}/ultima_conexion`]: timestamp,
    [`conductores_activos/${uid}/lat`]: lat,
    [`conductores_activos/${uid}/lng`]: lng,
    [`conductores_activos/${uid}/timestamp`]: timestamp
  };

  if (pedidoId) {
    updates[`pedidos/${pedidoId}/ubicacion_repartidor`] = ubicacion;
    const estadoPersistido = normalizeOrderState(stateHint);
    const estadoActual = normalizeOrderState(currentOrder?.estado_pedido || currentOrder?.estado);
    if (estadoPersistido && shouldAdvancePedidoState(estadoActual, estadoPersistido)) {
      updates[`pedidos/${pedidoId}/estado`] = estadoPersistido;
      updates[`pedidos/${pedidoId}/estado_pedido`] = estadoPersistido;
      updates[`pedidos/${pedidoId}/logistica/estado`] = estadoPersistido;
    }
    if (fasePanel) {
      updates[`pedidos/${pedidoId}/fase_panel`] = fasePanel;
    }
  }

  return { updates, ubicacion };
}

function buildDriverOfflineSyncWrites(uid, timestamp = Date.now()) {
  return {
    [`conductores_activos/${uid}`]: null,
    [`repartidores/${uid}/disponible`]: false,
    [`repartidores/${uid}/estado`]: 'OFFLINE',
    [`repartidores/${uid}/ultima_conexion`]: timestamp,
    [`repartidores/${uid}/offline_en`]: timestamp
  };
}

function buildDriverOnlineSyncWrites(uid, activePedidoId, timestamp = Date.now()) {
  const updates = {
    [`repartidores/${uid}/disponible`]: true,
    [`repartidores/${uid}/estado`]: 'DISPONIBLE',
    [`repartidores/${uid}/ultima_conexion`]: timestamp,
    [`repartidores_activos/${uid}/estado`]: 'DISPONIBLE',
    [`repartidores_activos/${uid}/disponible`]: true,
    [`repartidores_activos/${uid}/uid`]: uid,
    [`repartidores_activos/${uid}/actualizado_en`]: timestamp
  };
  if (!activePedidoId) updates[`repartidores/${uid}/pedido_activo`] = null;
  return updates;
}

function buildCompleteSyncWrites(pedidoId, order, driverUid, completedPayload) {
  const updates = {
    [`pedidos/${pedidoId}`]: { ...order, ...completedPayload },
    [`pedidos_en_camino/${pedidoId}`]: null,
    [`pedidos_para_reparto/${pedidoId}`]: null
  };
  if (driverUid) updates[`repartidores/${driverUid}/pedido_activo`] = null;
  return updates;
}

function buildPoolDispatchOrder(order = {}) {
  return limpiarAsignacionParaPool(order);
}

export {
  buildDispatchSyncWrites,
  buildAcceptSyncWrites,
  buildTransitionSyncWrites,
  buildLocationSyncWrites,
  buildDriverOfflineSyncWrites,
  buildDriverOnlineSyncWrites,
  buildCompleteSyncWrites,
  buildPoolDispatchOrder
};
