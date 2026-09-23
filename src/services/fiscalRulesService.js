const FISCAL_RULE_STATUSES = Object.freeze([
  'PARAMETER',
  'REFERENCE',
  'PENDING_VALIDATION',
  'VALIDATED_RULE',
  'EXPIRED'
]);

function createFiscalRule({
  id,
  jurisdiction = 'MX',
  taxpayerType = null,
  participantType = null,
  regime = null,
  operationType,
  tax,
  rate = null,
  base = null,
  withholding = false,
  effectiveFrom = null,
  effectiveTo = null,
  source = null,
  validationStatus = 'PENDING_VALIDATION',
  version = '1.0.0'
} = {}) {
  const rule = {
    id: String(id || '').trim(),
    jurisdiction: String(jurisdiction || '').trim().toUpperCase(),
    taxpayerType,
    participantType,
    regime,
    operationType: String(operationType || '').trim(),
    tax: String(tax || '').trim().toUpperCase(),
    rate: rate === null || rate === undefined ? null : Number(rate),
    base,
    withholding: Boolean(withholding),
    effectiveFrom,
    effectiveTo,
    source,
    validationStatus,
    version
  };

  if (!rule.id || !rule.operationType || !rule.tax) throw new Error('FISCAL_RULE_ID_OPERATION_TAX_REQUIRED');
  if (!FISCAL_RULE_STATUSES.includes(rule.validationStatus)) throw new Error('FISCAL_RULE_STATUS_INVALID');
  if (rule.rate !== null && (!Number.isFinite(rule.rate) || rule.rate < 0)) throw new Error('FISCAL_RULE_RATE_INVALID');
  return rule;
}

function evaluateFiscalRule(rule, { asOf = Date.now() } = {}) {
  const date = Number(asOf);
  const beforeStart = rule.effectiveFrom && date < Number(rule.effectiveFrom);
  const afterEnd = rule.effectiveTo && date > Number(rule.effectiveTo);
  if (rule.validationStatus !== 'VALIDATED_RULE') {
    return { applicable: false, status: 'RULE_PENDING_VALIDATION', taxAmount: null, rule };
  }
  if (beforeStart || afterEnd) {
    return { applicable: false, status: 'RULE_OUT_OF_EFFECT', taxAmount: null, rule };
  }
  return { applicable: true, status: 'RULE_APPLICABLE', taxAmount: null, rule };
}

export { FISCAL_RULE_STATUSES, createFiscalRule, evaluateFiscalRule };
