import { buildContract, validateRequiredFields } from './helpers.js';

const EVIDENCE_CONTRACT = buildContract(
  'Evidence',
  '1.0.0',
  'evidence',
  ['id', 'tipo', 'url', 'timestamp'],
  ['metadata', 'descripcion']
);

function validateEvidence(evidence = {}) {
  const result = validateRequiredFields(EVIDENCE_CONTRACT, evidence);
  return result.ok ? { ok: true, contract: EVIDENCE_CONTRACT } : { ok: false, contract: EVIDENCE_CONTRACT, missing: result.missing };
}

export { EVIDENCE_CONTRACT, validateEvidence };
