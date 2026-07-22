import { buildCanonicalOrder } from '../domain/index.js';

function normalizeOrderCreationInput(input = {}) {
  return {
    userId: String(input.userId || '').trim(),
    items: Array.isArray(input.items) ? input.items : [],
    total: Number(input.total),
    estado: String(input.estado || 'CREADO').trim().toUpperCase()
  };
}

function buildCanonicalOrderRecord(input = {}) {
  const normalized = normalizeOrderCreationInput(input);
  const canonical = buildCanonicalOrder({
    userId: normalized.userId,
    items: normalized.items,
    total: normalized.total,
    estado: normalized.estado
  });

  return {
    normalized,
    canonical
  };
}

function buildPersistedOrderRecord({ id, input = {} } = {}) {
  const { canonical } = buildCanonicalOrderRecord(input);
  return {
    ...canonical.order,
    id
  };
}

export {
  normalizeOrderCreationInput,
  buildCanonicalOrderRecord,
  buildPersistedOrderRecord
};
