import { normalizeOrderState } from './ordersManager.js';

function buildSupportInterventionPayload(pedidoId, message, bonus = 15.0) {
  return {
    [`pedidos/${pedidoId}/intervencionSoporte`]: true,
    [`pedidos/${pedidoId}/mensajeCliente`]: message,
    [`pedidos/${pedidoId}/bonoCompensacion`]: bonus
  };
}

function buildSupportRescuePayload(pedidoId, conductorId, estadoDestino, timestamp = Date.now()) {
  return {
    [`pedidos/${pedidoId}`]: {
      estado: normalizeOrderState(estadoDestino),
      conductorAnterior: conductorId,
      conductorId: '',
      timestampActualizacion: timestamp
    },
    [`conductores_activos/${conductorId}`]: {
      estado: 'PAUSADO_POR_SOPORTE'
    }
  };
}

function buildDispatchAssignmentPayload(pedidoId, conductorId, timestamp = Date.now()) {
  const estado = normalizeOrderState('EN_CURSO');
  return {
    [`pedidos/${pedidoId}/conductorId`]: conductorId,
    [`pedidos/${pedidoId}/repartidor_id`]: conductorId,
    [`pedidos/${pedidoId}/estado`]: estado,
    [`pedidos/${pedidoId}/estado_pedido`]: estado,
    [`pedidos/${pedidoId}/logistica/estado`]: estado,
    [`pedidos/${pedidoId}/logistica/repartidor_id`]: conductorId,
    [`pedidos/${pedidoId}/logistica/repartidor_uid`]: conductorId,
    [`pedidos/${pedidoId}/logistica/asignacion_activa`]: true,
    [`pedidos/${pedidoId}/timestampActualizacion`]: timestamp
  };
}

export {
  buildSupportInterventionPayload,
  buildSupportRescuePayload,
  buildDispatchAssignmentPayload
};
