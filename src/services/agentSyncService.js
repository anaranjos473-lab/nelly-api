function buildSupportInterventionPayload(pedidoId, message, bonus = 15.0) {
  return {
    [`pedidos/${pedidoId}/intervencionSoporte`]: true,
    [`pedidos/${pedidoId}/mensajeCliente`]: message,
    [`pedidos/${pedidoId}/bonoCompensacion`]: bonus
  };
}

import { normalizeState } from '../domain/stateMachine.js';
import { ORDER_STATES } from '../domain/index.js';

function buildSupportRescuePayload(pedidoId, conductorId, estadoDestino, timestamp = Date.now()) {
  return {
    [`pedidos/${pedidoId}`]: {
      estado: normalizeState(estadoDestino),
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
      estado: 'EN_CURSO',
      timestampActualizacion: timestamp
    }
  };
}

export {
  buildSupportInterventionPayload,
  buildSupportRescuePayload,
  buildDispatchAssignmentPayload
};
