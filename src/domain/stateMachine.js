export const ORDER_STATE_GRAPH = Object.freeze({
  PENDIENTE: Object.freeze(['LISTO', 'CANCELADO']),
  CREADO: Object.freeze(['PAGADO', 'CANCELADO']),
  PAGADO: Object.freeze(['VALIDADO', 'CANCELADO']),
  VALIDADO: Object.freeze(['EN_PROCESO', 'CANCELADO']),
  EN_PROCESO: Object.freeze(['LISTO', 'CANCELADO']),
  PARCIAL: Object.freeze(['EN_PROCESO', 'LISTO', 'ASIGNADO']),
  LISTO: Object.freeze(['ASIGNADO', 'CANCELADO']),
  EN_CURSO: Object.freeze(['ENTREGADO', 'CANCELADO']),
  ASIGNADO: Object.freeze(['EN_TRANSITO', 'CANCELADO']),
  EN_TRANSITO: Object.freeze(['ENTREGADO', 'CANCELADO']),
  ENTREGADO: Object.freeze(['CERRADO', 'REEMBOLSADO', 'DEVUELTO']),
  CERRADO: Object.freeze([]),
  CANCELADO: Object.freeze([]),
  DEVUELTO: Object.freeze([]),
  REEMBOLSADO: Object.freeze([])
});

export const STATE_EVENTS = Object.freeze({
  PENDIENTE: 'pedido.pendiente',
  CREADO: 'pedido.creado',
  PAGADO: 'pedido.pagado',
  VALIDADO: 'pedido.validado',
  EN_PROCESO: 'pedido.en_proceso',
  EN_CURSO: 'pedido.en_proceso',
  LISTO: 'pedido.listo',
  ASIGNADO: 'pedido.asignado',
  EN_TRANSITO: 'pedido.en_transito',
  ENTREGADO: 'pedido.entregado',
  CANCELADO: 'pedido.cancelado',
  REEMBOLSADO: 'pedido.reembolsado',
  DEVUELTO: 'pedido.devuelto',
  CERRADO: 'pedido.cerrado'
});

function normalizeState(value) {
  return String(value || '').trim().toUpperCase();
}

function getValidTransitions(state) {
  return [...(ORDER_STATE_GRAPH[normalizeState(state)] || [])];
}

function canTransition(from, to) {
  const actual = normalizeState(from);
  const target = normalizeState(to);
  if (!actual || !target) {
    return false;
  }
  if (actual === target) {
    return true;
  }
  return (ORDER_STATE_GRAPH[actual] || []).includes(target);
}

function getStateEvent(state) {
  return STATE_EVENTS[normalizeState(state)] || null;
}

function explainTransition(from, to) {
  return {
    from: normalizeState(from),
    to: normalizeState(to),
    allowed: canTransition(from, to),
    event: getStateEvent(to),
    validTargets: getValidTransitions(from)
  };
}

export {
  canTransition,
  explainTransition,
  getStateEvent,
  getValidTransitions,
  normalizeState
};
