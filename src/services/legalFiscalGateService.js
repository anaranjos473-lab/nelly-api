import { createLegalGate } from './legalGateService.js';

const CROSS_GATE_STATUSES = Object.freeze([
  'ALIGNED',
  'LEGAL_REVIEW_REQUIRED',
  'FISCAL_REVIEW_REQUIRED',
  'JOINT_REVIEW_REQUIRED',
  'BLOCKED'
]);

const FISCAL_REQUIRED_DOMAINS = Object.freeze([
  'COMISION_COMERCIO',
  'PAGO_REPARTIDOR',
  'REEMBOLSO_CLIENTE',
  'NELLY_LOGISTICS',
  'NELLY_STORE',
  'PUBLICIDAD_COMERCIOS'
]);

function buildLegalFiscalGate({
  caseId,
  domain,
  legalReview,
  fiscalCase = null,
  fiscalRequired = FISCAL_REQUIRED_DOMAINS.includes(String(domain || '').trim().toUpperCase()),
  actor = null,
  timestamp = Date.now()
} = {}) {
  const legalGate = createLegalGate({ review: legalReview, actor, action: 'CROSS_REVIEW' });
  const fiscalPending = fiscalRequired && (
    !fiscalCase
    || fiscalCase.certification?.status !== 'CERTIFIED'
    || fiscalCase.review?.statuses?.fiscal === 'FISCAL_PENDING'
    || fiscalCase.exceptions?.includes('FISCAL_RULE_PENDING_VALIDATION')
  );
  const legalBlocked = legalGate.status === 'BLOQUEADO';
  const legalEscalates = ['ESCALAR', 'RIESGO_JURIDICO'].includes(legalGate.status);
  const status = legalBlocked
    ? 'BLOCKED'
    : legalEscalates && fiscalPending
      ? 'JOINT_REVIEW_REQUIRED'
      : legalEscalates
        ? 'LEGAL_REVIEW_REQUIRED'
        : fiscalPending
          ? 'FISCAL_REVIEW_REQUIRED'
          : 'ALIGNED';
  const changeRequired = status !== 'ALIGNED';

  return Object.freeze({
    cross_gate_id: `LEGAL_FISCAL_GATE:${String(caseId || legalReview?.review_id || 'UNSPECIFIED').trim()}`,
    case_id: caseId || null,
    domain: String(domain || '').trim().toUpperCase(),
    status,
    legal: {
      status: legalGate.status,
      risk_level: legalGate.risk_level,
      requires_external_review: legalGate.requires_external_review,
      review_id: legalGate.review_id
    },
    fiscal: {
      required: fiscalRequired,
      pending: fiscalPending,
      fiscal_case_id: fiscalCase?.case_id || null,
      certification: fiscalCase?.certification?.status || null
    },
    change_control: {
      required: changeRequired,
      action: changeRequired ? 'OPEN_V1_2_ADR_IF_SYSTEM_CHANGE_IS_REQUIRED' : 'NO_CHANGE_REQUIRED'
    },
    actor,
    timestamp,
    source: 'NELLY-LEGAL-FISCAL'
  });
}

export { CROSS_GATE_STATUSES, FISCAL_REQUIRED_DOMAINS, buildLegalFiscalGate };
