function sanitizeFirebaseKey(value = '') {
  return String(value || 'global')
    .trim()
    .toLowerCase()
    .replace(/[.#$/\[\]]/g, '_')
    .replace(/\s+/g, '_')
    .replace(/_+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 120) || 'global';
}

function normalizeCommerceCode(value = '') {
  const raw = String(value || '')
    .trim()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toUpperCase();
  const cleaned = raw
    .replace(/[^A-Z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '');
  return cleaned.slice(0, 24) || 'COMERCIO';
}

function resolveCommerceIdentity(input = {}) {
  const commerceName = String(
    input.comercio_nombre
    || input.restaurante_nombre
    || input.tienda_nombre
    || input.restaurant_name
    || input.nombre_comercial
    || ''
  ).trim();
  const commerceId = String(
    input.comercio_id
    || input.tienda_id
    || input.merchant_id
    || input.restaurant_id
    || input.merchantId
    || input.restaurantId
    || ''
  ).trim();
  const commerceCode = normalizeCommerceCode(commerceId || commerceName || 'global');
  return {
    commerceKey: sanitizeFirebaseKey(commerceId || commerceName || 'global'),
    commerceCode,
    commerceName: commerceName || commerceId || commerceCode
  };
}

function formatShortIdFromSequence(timestamp, sequence, commerceCode = 'COMERCIO') {
  const date = new Date(Number(timestamp) || Date.now());
  const year = String(date.getUTCFullYear()).slice(-2);
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const seq = String(Math.max(1, Number(sequence) || 1)).padStart(2, '0');
  return `${normalizeCommerceCode(commerceCode)}-${year}${month}${day}-${seq}`;
}

async function allocateCommerceShortId(
  db,
  { timestamp = Date.now(), commerceKey = 'global', commerceCode = 'COMERCIO' } = {}
) {
  const day = new Date(Number(timestamp) || Date.now()).toISOString().slice(0, 10);
  const key = sanitizeFirebaseKey(commerceKey);
  const sequenceRef = db.ref(`order_sequences/${key}/${day}`);
  const transaction = await sequenceRef.transaction((current) => Number(current || 0) + 1);
  if (!transaction.committed) {
    throw new Error(`No se pudo asignar folio consecutivo para ${key}`);
  }
  const sequence = Number(transaction.snapshot.val() || 0);
  return {
    shortId: formatShortIdFromSequence(timestamp, sequence, commerceCode),
    commerceKey: key,
    commerceCode: normalizeCommerceCode(commerceCode),
    sequence,
    day
  };
}

export {
  allocateCommerceShortId,
  formatShortIdFromSequence,
  normalizeCommerceCode,
  resolveCommerceIdentity,
  sanitizeFirebaseKey
};
