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
  return {
    [`pedidos/${pedidoId}`]: {
      conductorId,
      estado: normalizeOrderState('EN_CURSO'),
      timestampActualizacion: timestamp
    }
  };
}

export {
  buildSupportInterventionPayload,
  buildSupportRescuePayload,
  buildDispatchAssignmentPayload
};
