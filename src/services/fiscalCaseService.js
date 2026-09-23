import { createFinancialEvent } from '../domain/contracts/financialEvent.js';
import { buildFiscalOrderReview } from './nellyFiscalService.js';
import { createCfdiRecord, matchCfdi } from './cfdiLifecycleService.js';
import { buildFiscalAuditTrail } from './fiscalAuditService.js';

function money(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? Number(amount.toFixed(2)) : null;
}

function getSettlementAmount(settlement) {
  if (!settlement) return null;
  return money(settlement.amount ?? settlement.total ?? settlement.monto ?? settlement.amount_total);
}

function getLedgerAmount(entries = []) {
  const values = entries
    .map((entry) => entry?.metadata?.fiscal_amount ?? entry?.fiscal_amount)
    .filter((value) => Number.isFinite(Number(value)))
    .map(Number);
  return values.length > 0 ? money(values.reduce((sum, value) => sum + value, 0)) : null;
}

function reconcileFiscalCase({ order = {}, ledgerEntries = [], settlement = null } = {}) {
  const orderId = String(order.id || order.id_pedido || order.pedido_id || '').trim();
  const expectedAmount = money(order.total ?? order.monto_total ?? order.monto);
  const ledgerReference = ledgerEntries.some((entry) => String(entry?.referencia_id || '') === orderId);
  const ledgerAmount = getLedgerAmount(ledgerEntries);
  const settlementAmount = getSettlementAmount(settlement);
  const reasons = [];

  if (!orderId) reasons.push('ORDER_REFERENCE_MISSING');
  if (!ledgerReference) reasons.push('LEDGER_REFERENCE_MISSING');
  if (expectedAmount === null) reasons.push('ORDER_TOTAL_MISSING');
  if (settlement && settlementAmount === null) reasons.push('SETTLEMENT_AMOUNT_MISSING');
  if (ledgerAmount !== null && expectedAmount !== null && ledgerAmount !== expectedAmount) {
    reasons.push('LEDGER_AMOUNT_MISMATCH');
  }
  if (settlementAmount !== null && expectedAmount !== null && settlementAmount !== expectedAmount) {
    reasons.push('SETTLEMENT_AMOUNT_MISMATCH');
  }

  const hasComparableEvidence = ledgerAmount !== null || settlementAmount !== null;
  const status = reasons.length > 0
    ? 'RECONCILIATION_EXCEPTION'
    : hasComparableEvidence && ledgerReference
      ? 'RECONCILED'
      : 'RECONCILIATION_PENDING';

  return {
    status,
    order_id: orderId,
    expected_amount: expectedAmount,
    ledger_amount: ledgerAmount,
    settlement_amount: settlementAmount,
    ledger_reference: ledgerReference,
    reasons: [...new Set(reasons)],
    action: reasons.length > 0 ? 'REVIEW_REQUIRED_NO_AUTOMATIC_CORRECTION' : 'READ_ONLY_CONTROL'
  };
}

function buildFiscalCase({ order = {}, ledgerEntries = [], settlement = null, cfdi = null, rules = [], actor = null, decision = 'REVIEW_PENDING', timestamp = Date.now() } = {}) {
  const orderId = String(order.id || order.id_pedido || order.pedido_id || '').trim();
  const review = buildFiscalOrderReview({ order, ledgerEntries });
  const event = createFinancialEvent({
    event_type: 'FINANCIAL_EVENT_CREATED',
    operation_id: orderId,
    order_id: orderId,
    gross_amount: review.amounts.gmv,
    currency: review.operation.currency,
    occurred_at: order.created_at || order.createdAt || order.fecha_creacion || Date.now(),
    idempotency_key: `FINANCIAL_EVENT_CREATED:${orderId}`,
    metadata: { source: 'NELLY-FISCAL', state: review.evidence.order_state }
  });
  const cfdiRecord = cfdi || createCfdiRecord({
    orderId,
    status: review.evidence.has_cfdi_reference ? 'RECEIVED' : 'PENDING',
    uuid: order.cfdi_id || order.cfdiId || order.uuid_cfdi,
    total: review.amounts.gmv,
    currency: review.operation.currency
  });
  const cfdiMatch = matchCfdi({ cfdi: cfdiRecord, order, ledgerEntries, settlement });
  const reconciliation = reconcileFiscalCase({ order, ledgerEntries, settlement });
  const relatedLedger = ledgerEntries.filter((entry) => String(entry?.referencia_id || '') === orderId);
  const exceptions = [
    ...review.missing,
    ...review.warnings,
    ...cfdiMatch.reasons,
    ...reconciliation.reasons,
    ...(!event.validation.ok ? ['FINANCIAL_EVENT_INVALID'] : []),
    ...(rules.some((rule) => rule?.validationStatus === 'VALIDATED_RULE') ? [] : ['FISCAL_RULE_PENDING_VALIDATION'])
  ];

  const fiscalCase = {
    case_id: `FISCAL_CASE:${orderId}`,
    order_id: orderId,
    review,
    financial_event: event,
    cfdi: cfdiRecord,
    cfdi_match: cfdiMatch,
    reconciliation,
    settlement: settlement ? { ...settlement } : null,
    rules: rules.map((rule) => ({ id: rule.id, version: rule.version, validationStatus: rule.validationStatus })),
    audit: {
      fiscal_case_id: `FISCAL_CASE:${orderId}`,
      financial_event_id: event.event_id,
      order_id: orderId,
      ledger_references: relatedLedger.map((entry) => entry.id || entry.idempotency_key).filter(Boolean),
      settlement_references: settlement
        ? [settlement.id || settlement.settlement_id || settlement.order_id].filter(Boolean)
        : [],
      cfdi_references: [cfdiRecord.uuid || cfdiRecord.id].filter(Boolean),
      rule_versions: rules.map((rule) => ({ id: rule.id, version: rule.version, status: rule.validationStatus })),
      exceptions: [...new Set(exceptions)],
      timestamp,
      actor,
      decision,
      evidence: {
        order: review.evidence,
        reconciliation,
        cfdi: cfdiMatch
      }
    },
    exceptions: [...new Set(exceptions)],
    certification: {
      status: 'NOT_CERTIFIED',
      reason: 'Professional fiscal and contractual validation is still pending.'
    }
  };

  fiscalCase.audit_trail = buildFiscalAuditTrail({ fiscalCase, actorId: actor, timestamp });
  return fiscalCase;
}

function buildFiscalControlCenter(cases = []) {
  const list = Array.isArray(cases) ? cases : [];
  const amount = (field) => list.reduce((sum, item) => sum + Number(item.review?.amounts?.[field] || 0), 0);
  return {
    period: 'UNSPECIFIED',
    totals: {
      orders: list.length,
      gmv: Number(amount('gmv').toFixed(2)),
      nelly_revenue: Number(amount('nelly_revenue').toFixed(2)),
      third_party_amount: Number(amount('third_party_amount').toFixed(2))
    },
    fiscal: {
      pending: list.filter((item) => item.review?.statuses?.fiscal === 'FISCAL_PENDING').length,
      exceptions: list.filter((item) => item.review?.state === 'EXCEPTION').length
    },
    cfdi: {
      pending: list.filter((item) => ['PENDING', 'EXPECTED'].includes(item.cfdi?.status)).length,
      matched: list.filter((item) => item.cfdi_match?.matched).length
    },
    accounting: {
      pending: list.filter((item) => item.review?.statuses?.accounting !== 'ACCOUNTED').length,
      accounted: list.filter((item) => item.review?.statuses?.accounting === 'ACCOUNTED').length
    },
    reconciliation: {
      pending: list.filter((item) => item.reconciliation?.status === 'RECONCILIATION_PENDING').length,
      exceptions: list.filter((item) => item.reconciliation?.status === 'RECONCILIATION_EXCEPTION').length,
      reconciled: list.filter((item) => item.reconciliation?.status === 'RECONCILED').length
    },
    certification: 'NOT_CERTIFIED'
  };
}

export { buildFiscalCase, buildFiscalControlCenter, reconcileFiscalCase };
