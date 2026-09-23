import crypto from 'node:crypto';

const FINANCIAL_EVENT_CONTRACT = Object.freeze({
  name: 'FinancialEvent',
  version: '1.0.0',
  required: ['event_id', 'event_type', 'operation_id', 'currency', 'occurred_at', 'idempotency_key'],
  optional: ['order_id', 'participant_id', 'gross_amount', 'net_amount', 'third_party_amount', 'nelly_amount', 'metadata']
});

function buildEventId(idempotencyKey) {
  const normalized = String(idempotencyKey || '').trim();
  if (!normalized) return null;
  const safe = normalized.replace(/[.#$\[\]/]/g, '_').replace(/[^a-zA-Z0-9_:-]/g, '_');
  const digest = crypto.createHash('sha256').update(normalized).digest('hex').slice(0, 16);
  return `${safe.slice(0, 96)}_${digest}`;
}

function validateFinancialEvent(event = {}) {
  const missing = FINANCIAL_EVENT_CONTRACT.required.filter((field) => {
    const value = event[field];
    return value === undefined || value === null || String(value).trim() === '';
  });
  const amounts = ['gross_amount', 'net_amount', 'third_party_amount', 'nelly_amount']
    .filter((field) => event[field] !== undefined && event[field] !== null)
    .filter((field) => !Number.isFinite(Number(event[field])) || Number(event[field]) < 0);

  return {
    ok: missing.length === 0 && amounts.length === 0,
    missing,
    invalid_amounts: amounts,
    contract: FINANCIAL_EVENT_CONTRACT
  };
}

function createFinancialEvent({
  event_type,
  operation_id,
  order_id = operation_id,
  participant_id = null,
  gross_amount = null,
  net_amount = null,
  third_party_amount = null,
  nelly_amount = null,
  currency = 'MXN',
  occurred_at = Date.now(),
  idempotency_key,
  metadata = {}
} = {}) {
  const normalizedKey = String(idempotency_key || '').trim();
  const event = {
    event_id: buildEventId(normalizedKey),
    event_type: String(event_type || '').trim(),
    operation_id: String(operation_id || '').trim(),
    order_id: order_id ? String(order_id).trim() : null,
    participant_id: participant_id ? String(participant_id).trim() : null,
    gross_amount,
    net_amount,
    third_party_amount,
    nelly_amount,
    currency: String(currency || 'MXN').trim().toUpperCase(),
    occurred_at,
    idempotency_key: normalizedKey,
    metadata: { ...metadata }
  };
  const validation = validateFinancialEvent(event);
  return { ...event, validation };
}

export { FINANCIAL_EVENT_CONTRACT, createFinancialEvent, validateFinancialEvent };
