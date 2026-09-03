import { buildContract, validateRequiredFields } from './helpers.js';

const LEDGER_ENTRY_CONTRACT = buildContract(
  'LedgerEntry',
  '1.0.0',
  'ledger_entry',
  ['id', 'tipo', 'monto', 'moneda', 'referencia_id', 'idempotency_key', 'ocurrido_en'],
  ['metadata', 'descripcion']
);

function validateLedgerEntry(entry = {}) {
  const result = validateRequiredFields(LEDGER_ENTRY_CONTRACT, entry);
  return result.ok ? { ok: true, contract: LEDGER_ENTRY_CONTRACT } : { ok: false, contract: LEDGER_ENTRY_CONTRACT, missing: result.missing };
}

export { LEDGER_ENTRY_CONTRACT, validateLedgerEntry };
