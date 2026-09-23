const CFDI_STATUSES = Object.freeze([
  'NO_REQUIRED',
  'EXPECTED',
  'PENDING',
  'RECEIVED',
  'ISSUED',
  'VALIDATED',
  'MATCHED',
  'CONCILIATED',
  'CANCELLED',
  'SUBSTITUTED',
  'REJECTED',
  'DUPLICATE',
  'ORPHAN'
]);

const CFDI_TRANSITIONS = Object.freeze({
  EXPECTED: ['PENDING', 'NO_REQUIRED', 'REJECTED'],
  PENDING: ['RECEIVED', 'ISSUED', 'REJECTED'],
  RECEIVED: ['VALIDATED', 'DUPLICATE', 'REJECTED'],
  ISSUED: ['VALIDATED', 'CANCELLED', 'SUBSTITUTED', 'DUPLICATE', 'REJECTED'],
  VALIDATED: ['MATCHED', 'CANCELLED', 'SUBSTITUTED'],
  MATCHED: ['CONCILIATED', 'CANCELLED', 'SUBSTITUTED'],
  CONCILIATED: ['CANCELLED', 'SUBSTITUTED'],
  NO_REQUIRED: [],
  CANCELLED: [],
  SUBSTITUTED: [],
  REJECTED: [],
  DUPLICATE: [],
  ORPHAN: []
});

function createCfdiRecord({ orderId, status = 'PENDING', uuid = null, total = null, currency = 'MXN', evidence = [] } = {}) {
  if (!String(orderId || '').trim()) throw new Error('CFDI_ORDER_ID_REQUIRED');
  if (!CFDI_STATUSES.includes(status)) throw new Error('CFDI_STATUS_INVALID');
  return {
    order_id: String(orderId).trim(),
    status,
    uuid: uuid ? String(uuid).trim() : null,
    total: total === null || total === undefined ? null : Number(total),
    currency: String(currency || 'MXN').trim().toUpperCase(),
    evidence: Array.isArray(evidence) ? [...evidence] : []
  };
}

function transitionCfdi(record, nextStatus, metadata = {}) {
  const next = String(nextStatus || '').trim().toUpperCase();
  if (!CFDI_STATUSES.includes(next)) throw new Error('CFDI_STATUS_INVALID');
  const allowed = CFDI_TRANSITIONS[record.status] || [];
  if (!allowed.includes(next)) throw new Error(`CFDI_TRANSITION_INVALID:${record.status}->${next}`);
  return { ...record, ...metadata, status: next, updated_at: Date.now() };
}

function matchCfdi({ cfdi, order = {}, ledgerEntries = [], settlement = null } = {}) {
  const reasons = [];
  const orderId = String(order.id || order.id_pedido || order.pedido_id || '').trim();
  const orderTotal = Number(order.total ?? order.monto_total ?? order.monto);
  if (!cfdi?.uuid) reasons.push('CFDI_UUID_MISSING');
  if (!orderId || cfdi?.order_id !== orderId) reasons.push('ORDER_REFERENCE_MISMATCH');
  if (cfdi?.total !== null && Number.isFinite(orderTotal) && Number(cfdi.total) !== orderTotal) reasons.push('TOTAL_MISMATCH');
  if (!ledgerEntries.some((entry) => String(entry?.referencia_id || '') === orderId)) reasons.push('LEDGER_REFERENCE_MISSING');
  if (settlement && String(settlement.order_id || settlement.reference_id || '') !== orderId) reasons.push('SETTLEMENT_REFERENCE_MISMATCH');
  return { matched: reasons.length === 0, reasons };
}

export { CFDI_STATUSES, createCfdiRecord, matchCfdi, transitionCfdi };
