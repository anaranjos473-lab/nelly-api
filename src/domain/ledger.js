import { LEDGER_ENTRY_CONTRACT, validateLedgerEntry } from './contracts/ledgerEntry.js';
import crypto from 'node:crypto';

function buildDeterministicEntryId(idempotencyKey) {
  const key = String(idempotencyKey || '').trim();
  if (!key) return null;
  const safeKey = key.replace(/[.#$\[\]/]/g, '_').replace(/[^a-zA-Z0-9_:-]/g, '_');
  const digest = crypto.createHash('sha256').update(key).digest('hex').slice(0, 16);
  return `${safeKey.slice(0, 100)}_${digest}`;
}

function createLedgerEntry({
  tipo,
  subtipo = null,
  origen = 'domain',
  referencia_id,
  actor_id = null,
  monto = 0,
  moneda = 'MXN',
  saldo_antes = 0,
  idempotency_key,
  ocurrido_en = Date.now(),
  registrado_en = Date.now(),
  metadata = {}
} = {}) {
  const resolvedIdempotencyKey = String(idempotency_key || '').trim();
  const entry = Object.freeze({
    id: buildDeterministicEntryId(resolvedIdempotencyKey),
    tipo,
    subtipo,
    origen,
    referencia_id,
    actor_id,
    monto: Number(monto),
    moneda,
    saldo_antes: Number(saldo_antes),
    saldo_despues: Number(saldo_antes) + Number(monto),
    idempotency_key: resolvedIdempotencyKey,
    ocurrido_en,
    registrado_en,
    metadata: { ...metadata }
  });

  return {
    ...entry,
    validation: validateLedgerEntry(entry)
  };
}

function createLedger(entries = []) {
  const history = [];

  for (const raw of entries) {
    const entry = createLedgerEntry(raw);
    if (!entry.validation.ok) {
      throw new Error(`Ledger entry invalida: ${entry.validation.missing.join(', ')}`);
    }
    history.push(entry);
  }

  function append(raw) {
    const currentBalance = getBalance();
    const entry = createLedgerEntry({
      ...raw,
      saldo_antes: currentBalance
    });
    if (!entry.validation.ok) {
      throw new Error(`Ledger entry invalida: ${entry.validation.missing.join(', ')}`);
    }
    history.push(entry);
    return entry;
  }

  function getEntries() {
    return [...history];
  }

  function getBalance() {
    return history.reduce((total, entry) => total + Number(entry.monto || 0), 0);
  }

  function reconcile(expectedBalance = 0) {
    const actual = getBalance();
    return {
      ok: actual === Number(expectedBalance),
      actual,
      expected: Number(expectedBalance),
      delta: actual - Number(expectedBalance)
    };
  }

  return {
    append,
    getEntries,
    getBalance,
    reconcile
  };
}

function projectLedger(entries = []) {
  return entries.reduce((state, entry) => {
    const current = Number(state.balance || 0);
    const amount = Number(entry.monto || 0);
    return {
      balance: current + amount,
      lastEntry: entry,
      count: Number(state.count || 0) + 1
    };
  }, { balance: 0, lastEntry: null, count: 0 });
}

export {
  LEDGER_ENTRY_CONTRACT,
  createLedgerEntry,
  createLedger,
  projectLedger
};
