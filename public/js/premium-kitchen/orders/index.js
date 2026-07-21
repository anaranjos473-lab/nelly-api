export function normalizeOrderState(value) {
  return String(value || '').trim().toUpperCase();
}

export function classifyOrderPhase(value) {
  const state = normalizeOrderState(value);
  if (state === 'LISTO') return 'LISTOS';
  if (state === 'EN_CURSO' || state === 'EN_CAMINO') return 'EN_REPARTO';
  if (state === 'ENTREGADO') return 'ENTREGADOS';
  return 'NUEVOS';
}

export function buildOrderViewModel(order = {}) {
  return { ...order };
}

export async function dispatchOrderAction() {
  throw new Error('premium_kitchen_stage_a_placeholder');
}

export async function completeOrderAction() {
  throw new Error('premium_kitchen_stage_a_placeholder');
}

