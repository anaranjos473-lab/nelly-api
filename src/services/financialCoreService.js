import { createLedgerEntry } from '../domain/ledger.js';

const LEDGER_TYPES = Object.freeze([
  'TARIFA_ENVIO_CLIENTE',
  'PAGO_REPARTIDOR',
  'COMISION_NELLY',
  'INCENTIVO',
  'PROPINA',
  'COBRO_EFECTIVO',
  'REEMBOLSO',
  'DEVOLUCION',
  'AJUSTE_MANUAL',
  'LIQUIDACION'
]);

function roundMoney(value) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) throw new Error('FINANCIAL_INVALID_AMOUNT');
  return Math.round((amount + Number.EPSILON) * 100) / 100;
}

function buildIdempotencyKey(tipo, referenciaId) {
  const normalizedType = String(tipo || '').trim().toUpperCase();
  const normalizedReference = String(referenciaId || '').trim();
  if (!normalizedType || !normalizedReference) throw new Error('FINANCIAL_REFERENCE_REQUIRED');
  return `${normalizedType}:${normalizedReference}`;
}

function buildFinancialEntry({
  tipo,
  subtipo = null,
  origen,
  referencia_id,
  actor_id = null,
  monto,
  moneda = 'MXN',
  idempotency_key = null,
  ocurrido_en = Date.now(),
  registrado_en = ocurrido_en,
  metadata = {}
} = {}) {
  if (!LEDGER_TYPES.includes(tipo)) throw new Error('FINANCIAL_INVALID_TYPE');
  const entry = createLedgerEntry({
    tipo,
    subtipo,
    origen,
    referencia_id,
    actor_id,
    monto: roundMoney(monto),
    moneda,
    idempotency_key: idempotency_key || buildIdempotencyKey(tipo, referencia_id),
    ocurrido_en,
    registrado_en,
    metadata
  });
  if (!entry.validation.ok) throw new Error('FINANCIAL_INVALID_ENTRY');
  return entry;
}

function assertCompatibleEntry(existing, requested) {
  const fields = ['id', 'tipo', 'referencia_id', 'monto', 'actor_id', 'idempotency_key'];
  const compatible = fields.every((field) => String(existing?.[field] ?? '') === String(requested?.[field] ?? ''));
  if (!compatible) {
    const error = new Error('IDEMPOTENCY_CONFLICT');
    error.code = 'IDEMPOTENCY_CONFLICT';
    throw error;
  }
  return existing;
}

function projectDerivedFinance(current = {}, entry) {
  const next = { ...current };
  const finanzas = { ...(current.finanzas || {}) };
  const billetera = { ...(current.billetera || {}) };
  const amount = roundMoney(entry.monto);

  if (entry.tipo === 'COMISION_NELLY') {
    finanzas.saldo_ganancias = roundMoney(Number(finanzas.saldo_ganancias || 0) + amount);
    finanzas.deuda_actual = roundMoney(Number(finanzas.deuda_actual || 0) + Math.max(0, -amount));
    billetera.deuda_comision = finanzas.deuda_actual;
  } else if (entry.tipo === 'COBRO_EFECTIVO') {
    finanzas.saldo_efectivo = roundMoney(Number(finanzas.saldo_efectivo || 0) + amount);
  } else if (['PAGO_REPARTIDOR', 'INCENTIVO', 'PROPINA', 'REEMBOLSO', 'DEVOLUCION', 'AJUSTE_MANUAL'].includes(entry.tipo)) {
    finanzas.saldo_ganancias = roundMoney(Number(finanzas.saldo_ganancias || 0) + amount);
  } else if (entry.tipo === 'LIQUIDACION') {
    const bucket = String(entry.subtipo || '').toUpperCase();
    if (bucket === 'EFECTIVO') {
      finanzas.saldo_efectivo = roundMoney(Number(finanzas.saldo_efectivo || 0) + amount);
    } else if (bucket === 'DEUDA') {
      finanzas.deuda_actual = roundMoney(Math.max(0, Number(finanzas.deuda_actual || 0) + amount));
      billetera.deuda_comision = finanzas.deuda_actual;
    } else {
      finanzas.saldo_ganancias = roundMoney(Number(finanzas.saldo_ganancias || 0) + amount);
    }
  }

  return { ...next, finanzas, billetera };
}

async function applyDerivedFinanceOnce(db, entry) {
  if (!entry.actor_id) return false;

  const driverRef = db.ref(`repartidores/${entry.actor_id}`);
  const transaction = await driverRef.transaction((current) => {
    const driver = current || {};
    const finanzas = { ...(driver.finanzas || {}) };
    const applied = { ...(finanzas.ledger_aplicado || {}) };
    if (applied[entry.id]) return driver;

    const next = projectDerivedFinance(driver, entry);
    next.finanzas.ledger_aplicado = { ...applied, [entry.id]: true };
    return next;
  });

  return Boolean(transaction.committed);
}

async function appendFinancialEntry(db, entry) {
  const { validation: _validation, ...persistableEntry } = entry;
  const ledgerRef = db.ref(`ledger/${entry.id}`);
  const existingSnapshot = await ledgerRef.once('value');
  const existing = existingSnapshot.val();
  if (existing) {
    const persisted = assertCompatibleEntry(existing, entry);
    await applyDerivedFinanceOnce(db, persisted);
    return { created: false, entry: persisted };
  }

  const transaction = await ledgerRef.transaction((current) => current || persistableEntry);
  const persisted = transaction.snapshot?.val?.() || persistableEntry;
  assertCompatibleEntry(persisted, persistableEntry);

  await applyDerivedFinanceOnce(db, persisted);

  return { created: Boolean(transaction.committed), entry: persisted };
}

export {
  LEDGER_TYPES,
  buildIdempotencyKey,
  buildFinancialEntry,
  assertCompatibleEntry,
  projectDerivedFinance,
  applyDerivedFinanceOnce,
  appendFinancialEntry
};
