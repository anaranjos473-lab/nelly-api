import crypto from 'node:crypto';

const AUDIT_VERSION = '1.0.0';

function canonicalize(value) {
  return JSON.stringify(value, Object.keys(value || {}).sort());
}

function hashEvent(event) {
  const payload = { ...event };
  delete payload.audit_event_id;
  delete payload.event_hash;
  return crypto.createHash('sha256').update(canonicalize(payload)).digest('hex');
}

function createFiscalAuditEvent({
  fiscalCaseId,
  eventType,
  actorId = null,
  actorRole = null,
  action,
  previousState = null,
  newState = null,
  reason = null,
  ruleVersion = null,
  source = 'NELLY-FISCAL',
  correlationId = fiscalCaseId,
  evidenceRefs = [],
  timestamp = Date.now(),
  sequence = 1,
  previousHash = null
} = {}) {
  const normalizedCase = String(fiscalCaseId || '').trim();
  const normalizedType = String(eventType || '').trim().toUpperCase();
  if (!normalizedCase) throw new Error('FISCAL_AUDIT_CASE_REQUIRED');
  if (!normalizedType) throw new Error('FISCAL_AUDIT_EVENT_REQUIRED');
  if (!String(action || '').trim()) throw new Error('FISCAL_AUDIT_ACTION_REQUIRED');
  const event = {
    audit_version: AUDIT_VERSION,
    fiscal_case_id: normalizedCase,
    event_type: normalizedType,
    actor_id: actorId,
    actor_role: actorRole,
    action: String(action).trim(),
    previous_state: previousState,
    new_state: newState,
    reason,
    rule_version: ruleVersion,
    source: String(source || 'NELLY-FISCAL').trim(),
    correlation_id: String(correlationId || normalizedCase).trim(),
    evidence_refs: Array.isArray(evidenceRefs) ? [...evidenceRefs] : [],
    timestamp,
    sequence: Number(sequence),
    previous_hash: previousHash
  };
  const eventHash = hashEvent(event);
  return Object.freeze({
    ...event,
    audit_event_id: `FISCAL_AUDIT:${eventHash.slice(0, 24)}`,
    event_hash: eventHash
  });
}

function appendFiscalAuditEvent(history = [], eventInput = {}) {
  if (!Array.isArray(history)) throw new Error('FISCAL_AUDIT_HISTORY_INVALID');
  const previous = history.at(-1) || null;
  const event = createFiscalAuditEvent({
    ...eventInput,
    sequence: history.length + 1,
    previousHash: previous?.event_hash || null
  });
  return Object.freeze([...history, event]);
}

function verifyFiscalAuditTrail(history = []) {
  if (!Array.isArray(history)) return { ok: false, reason: 'FISCAL_AUDIT_HISTORY_INVALID' };
  let previousHash = null;
  for (let index = 0; index < history.length; index += 1) {
    const event = history[index];
    if (event.sequence !== index + 1 || event.previous_hash !== previousHash || hashEvent(event) !== event.event_hash) {
      return { ok: false, reason: 'FISCAL_AUDIT_CHAIN_INVALID', index };
    }
    previousHash = event.event_hash;
  }
  return { ok: true, length: history.length, last_hash: previousHash };
}

function buildFiscalAuditTrail({ fiscalCase, actorId = null, actorRole = null, timestamp = Date.now() } = {}) {
  const caseId = fiscalCase?.case_id;
  const refs = fiscalCase?.audit || {};
  let history = [];
  const add = (eventType, details = {}) => {
    history = appendFiscalAuditEvent(history, {
      fiscalCaseId: caseId,
      eventType,
      actorId,
      actorRole,
      timestamp,
      evidenceRefs: details.evidenceRefs || [],
      ...details
    });
  };

  add('CASE_CREATED', { action: 'CREATE_FISCAL_CASE', newState: fiscalCase.certification?.status });
  add('FINANCIAL_EVENT_LINKED', { action: 'LINK_FINANCIAL_EVENT', evidenceRefs: [refs.financial_event_id].filter(Boolean) });
  add(fiscalCase.review?.evidence?.has_ledger_reference ? 'LEDGER_MATCHED' : 'EXCEPTION_DETECTED', {
    action: fiscalCase.review?.evidence?.has_ledger_reference ? 'MATCH_LEDGER' : 'FLAG_LEDGER_REFERENCE',
    reason: fiscalCase.review?.evidence?.has_ledger_reference ? null : 'LEDGER_REFERENCE_MISSING',
    evidenceRefs: refs.ledger_references || []
  });
  if (refs.settlement_references?.length) {
    add('SETTLEMENT_MATCHED', { action: 'MATCH_SETTLEMENT', evidenceRefs: refs.settlement_references });
  }
  add(fiscalCase.cfdi_match?.matched ? 'CFDI_VALIDATED' : 'EXCEPTION_DETECTED', {
    action: 'MATCH_CFDI',
    reason: fiscalCase.cfdi_match?.matched ? null : (fiscalCase.cfdi_match?.reasons || []).join(','),
    evidenceRefs: refs.cfdi_references || []
  });
  add('RULE_EVALUATED', {
    action: 'EVALUATE_FISCAL_RULES',
    ruleVersion: (refs.rule_versions || []).map((rule) => rule.version).filter(Boolean).join(',') || null
  });
  if (fiscalCase.exceptions?.length) {
    add('EXCEPTION_DETECTED', { action: 'RECORD_FISCAL_EXCEPTIONS', reason: fiscalCase.exceptions.join(',') });
  }
  return history;
}

export {
  AUDIT_VERSION,
  createFiscalAuditEvent,
  appendFiscalAuditEvent,
  verifyFiscalAuditTrail,
  buildFiscalAuditTrail
};
