import crypto from 'node:crypto';

const LEGAL_GATE_STATUSES = Object.freeze([
  'VIABLE',
  'VIABLE_CON_CONDICIONES',
  'RIESGO_JURIDICO',
  'BLOQUEADO',
  'ESCALAR'
]);

const LEGAL_RISK_LEVELS = Object.freeze(['BAJO', 'MEDIO', 'ALTO', 'CRITICO']);

function normalizeList(value) {
  if (Array.isArray(value)) return value.map((item) => String(item).trim()).filter(Boolean);
  if (value === null || value === undefined || value === '') return [];
  return [String(value).trim()];
}

function buildLegalReviewId({ id, module, decision, date }) {
  const source = String(id || `${module || 'LEGAL'}:${decision || 'REVIEW'}:${date || Date.now()}`).trim();
  const digest = crypto.createHash('sha256').update(source).digest('hex').slice(0, 16);
  return `LEGAL_REVIEW:${digest}`;
}

function createLegalReview({
  id = null,
  date = new Date().toISOString(),
  module,
  decision,
  participants = [],
  facts = [],
  operationalModel = [],
  legalFigures = [],
  applicableNorms = [],
  obligations = [],
  responsibilities = [],
  risks = [],
  documents = [],
  fiscalImplications = [],
  technicalImplications = [],
  operationalImplications = [],
  controls = [],
  evidence = [],
  status = 'ESCALAR',
  riskLevel = 'ALTO',
  actions = [],
  escalation = [],
  reviewer = null,
  jurisdiction = 'MX'
} = {}) {
  const review = {
    review_id: buildLegalReviewId({ id, module, decision, date }),
    date,
    jurisdiction: String(jurisdiction || '').trim().toUpperCase(),
    module: String(module || '').trim(),
    decision: String(decision || '').trim(),
    participants: normalizeList(participants),
    facts: normalizeList(facts),
    operational_model: normalizeList(operationalModel),
    legal_figures: normalizeList(legalFigures),
    applicable_norms: normalizeList(applicableNorms),
    obligations: normalizeList(obligations),
    responsibilities: normalizeList(responsibilities),
    risks: normalizeList(risks),
    documents: normalizeList(documents),
    fiscal_implications: normalizeList(fiscalImplications),
    technical_implications: normalizeList(technicalImplications),
    operational_implications: normalizeList(operationalImplications),
    controls: normalizeList(controls),
    evidence: normalizeList(evidence),
    status: String(status || '').trim().toUpperCase(),
    risk_level: String(riskLevel || '').trim().toUpperCase(),
    actions: normalizeList(actions),
    escalation: normalizeList(escalation),
    reviewer: reviewer ? { ...reviewer } : null,
    source: 'NELLY-LEGAL'
  };
  return { ...review, validation: validateLegalReview(review) };
}

function validateLegalReview(review = {}) {
  const required = ['review_id', 'date', 'module', 'decision', 'jurisdiction', 'status', 'risk_level'];
  const missing = required.filter((field) => !String(review[field] || '').trim());
  const invalidStatus = review.status && !LEGAL_GATE_STATUSES.includes(review.status) ? ['status'] : [];
  const invalidRisk = review.risk_level && !LEGAL_RISK_LEVELS.includes(review.risk_level) ? ['risk_level'] : [];
  return {
    ok: missing.length === 0 && invalidStatus.length === 0 && invalidRisk.length === 0,
    missing,
    invalid: [...invalidStatus, ...invalidRisk]
  };
}

function createLegalGate({ review, actor = null, action = 'REVIEW' } = {}) {
  const validation = validateLegalReview(review);
  const status = review?.status || 'ESCALAR';
  return {
    gate_id: `LEGAL_GATE:${review?.review_id || 'INVALID'}`,
    status,
    risk_level: review?.risk_level || 'CRITICO',
    approved: validation.ok && ['VIABLE', 'VIABLE_CON_CONDICIONES'].includes(status),
    requires_external_review: !validation.ok || status === 'ESCALAR' || ['ALTO', 'CRITICO'].includes(review?.risk_level),
    actor,
    action,
    review_id: review?.review_id || null,
    evidence: [...(review?.evidence || [])],
    validation,
    source: 'NELLY-LEGAL'
  };
}

export {
  LEGAL_GATE_STATUSES,
  LEGAL_RISK_LEVELS,
  createLegalReview,
  validateLegalReview,
  createLegalGate
};
