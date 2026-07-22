import { LEDGER_ENTRY_CONTRACT, validateLedgerEntry } from './contracts/ledgerEntry.js';

function createLedgerEntry({
  tipo,
  subtipo = null,
  origen = 'domain',
  referencia_id,
  actor_id = null,
  monto = 0,
  moneda = 'MXN',
  saldo_antes = 0,
  ocurrio_en = Date.now(),
  registrado_en = Date.now(),
  metadata = {}
} = {}) {
  const entry = Object.freeze({
    id: `${String(tipo || 'mov').toLowerCase()}_${String(referencia_id || 'ref')}_${ocurrio_en}`,
    tipo,
    subtipo,
    origen,
    referencia_id,
    actor_id,
    monto: Number(monto),
    moneda,
    saldo_antes: Number(saldo_antes),
    saldo_despues: Number(saldo_antes) + Number(monto),
    ocurrido_en: ocurrio_en,
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
