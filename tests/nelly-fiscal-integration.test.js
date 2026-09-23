import { describe, expect, it } from '@jest/globals';
import { buildFinancialEntry, appendFinancialEntry } from '../src/services/financialCoreService.js';
import { createFinancialEvent } from '../src/domain/contracts/financialEvent.js';
import { createCfdiRecord, matchCfdi } from '../src/services/cfdiLifecycleService.js';
import { buildFiscalCase, reconcileFiscalCase } from '../src/services/fiscalCaseService.js';
import {
  appendFiscalAuditEvent,
  createFiscalAuditEvent,
  verifyFiscalAuditTrail
} from '../src/services/fiscalAuditService.js';

class MemoryDb {
  constructor() {
    this.data = {};
  }

  ref(path) {
    const db = this;
    return {
      async once() {
        return { val: () => db.data[path] ?? null };
      },
      async transaction(updater) {
        const current = db.data[path] ?? null;
        const next = updater(current);
        db.data[path] = next;
        return { committed: next !== current, snapshot: { val: () => next } };
      }
    };
  }
}

const completeOrder = (overrides = {}) => ({
  id: 'PED_INT_1',
  cliente_nombre: 'Cliente',
  comercio_id: 'COM_1',
  subtotal: 100,
  costo_envio: 20,
  propina: 0,
  total: 120,
  pago: { metodo: 'efectivo' },
  created_at: 1,
  estado: 'ENTREGADO',
  ...overrides
});

describe('NELLY-FISCAL integration certification', () => {
  it('connects FinancialEvent to the ledger with real idempotency', async () => {
    const db = new MemoryDb();
    const event = createFinancialEvent({
      event_type: 'ORDER_PAYMENT_CAPTURED', operation_id: 'PED_INT_1',
      gross_amount: 120, idempotency_key: 'ORDER_PAYMENT_CAPTURED:PED_INT_1'
    });
    const entry = buildFinancialEntry({
      tipo: 'COBRO_EFECTIVO', origen: 'nelly-fiscal-test', referencia_id: event.order_id,
      monto: event.gross_amount, idempotency_key: event.idempotency_key,
      metadata: { financial_event_id: event.event_id, fiscal_amount: 120 }
    });

    const first = await appendFinancialEntry(db, entry);
    const second = await appendFinancialEntry(db, entry);
    expect(first.created).toBe(true);
    expect(second.created).toBe(false);
    expect(Object.keys(db.data)).toHaveLength(1);
    expect(second.entry.id).toBe(first.entry.id);
  });

  it('rejects a conflicting duplicate idempotency key', async () => {
    const db = new MemoryDb();
    const base = buildFinancialEntry({
      tipo: 'COBRO_EFECTIVO', origen: 'test', referencia_id: 'PED_CONFLICT', monto: 100,
      idempotency_key: 'PAYMENT:PED_CONFLICT'
    });
    await appendFinancialEntry(db, base);
    const conflict = { ...base, monto: 101 };
    await expect(appendFinancialEntry(db, conflict)).rejects.toThrow('IDEMPOTENCY_CONFLICT');
  });

  it('connects FinancialEvent, FiscalCase, CFDI and settlement evidence', () => {
    const order = completeOrder();
    const ledgerEntries = [{
      referencia_id: order.id, tipo: 'COBRO_EFECTIVO', monto: 120,
      metadata: { fiscal_amount: 120 }
    }];
    const settlement = { order_id: order.id, amount: 120, status: 'READY' };
    const cfdi = createCfdiRecord({ orderId: order.id, uuid: 'UUID-1', total: 120, status: 'RECEIVED' });
    const fiscalCase = buildFiscalCase({ order, ledgerEntries, settlement, cfdi });

    expect(fiscalCase.financial_event.validation.ok).toBe(true);
    expect(fiscalCase.audit.financial_event_id).toBe(fiscalCase.financial_event.event_id);
    expect(fiscalCase.audit.order_id).toBe(order.id);
    expect(fiscalCase.audit.settlement_references).toContain(order.id);
    expect(fiscalCase.audit.decision).toBe('REVIEW_PENDING');
    expect(verifyFiscalAuditTrail(fiscalCase.audit_trail).ok).toBe(true);
    expect(fiscalCase.audit_trail.map((event) => event.event_type)).toEqual(expect.arrayContaining([
      'CASE_CREATED', 'FINANCIAL_EVENT_LINKED', 'LEDGER_MATCHED', 'SETTLEMENT_MATCHED', 'CFDI_VALIDATED'
    ]));
    expect(fiscalCase.cfdi_match.matched).toBe(true);
    expect(fiscalCase.reconciliation.status).toBe('RECONCILED');
    expect(fiscalCase.certification.status).toBe('NOT_CERTIFIED');
  });

  it('raises a read-only exception when ledger and settlement differ', () => {
    const order = completeOrder();
    const result = reconcileFiscalCase({
      order,
      ledgerEntries: [{ referencia_id: order.id, metadata: { fiscal_amount: 119 } }],
      settlement: { order_id: order.id, amount: 121 }
    });
    expect(result.status).toBe('RECONCILIATION_EXCEPTION');
    expect(result.reasons).toEqual(expect.arrayContaining([
      'LEDGER_AMOUNT_MISMATCH', 'SETTLEMENT_AMOUNT_MISMATCH'
    ]));
    expect(result.action).toBe('REVIEW_REQUIRED_NO_AUTOMATIC_CORRECTION');
  });

  it.each([
    ['efectivo', { metodo: 'efectivo' }],
    ['electronico', { metodo: 'tarjeta' }]
  ])('preserves payment method as evidence: %s', (_label, payment) => {
    const fiscalCase = buildFiscalCase({ order: completeOrder({ pago: payment }) });
    expect(fiscalCase.review.operation.payment_method).toBe(payment.metodo);
  });

  it('keeps tip and third-party ownership unresolved instead of inventing tax treatment', () => {
    const fiscalCase = buildFiscalCase({ order: completeOrder({ propina: 15, total: 135 }) });
    expect(fiscalCase.review.amounts.tip).toBe(15);
    expect(fiscalCase.review.amounts.third_party_amount).toBeNull();
    expect(fiscalCase.review.amounts.tax_amount).toBeNull();
    expect(fiscalCase.review.classification.revenue_owner).toBe('PENDING_CONTRACTUAL_REVIEW');
  });

  it('keeps refund and cancellation visible as operational evidence', () => {
    const refundCase = buildFiscalCase({
      order: completeOrder({ estado: 'REEMBOLSADO', total: 120 }),
      ledgerEntries: [{ referencia_id: 'PED_INT_1', tipo: 'REEMBOLSO', monto: -120 }]
    });
    const cancelledCase = buildFiscalCase({ order: completeOrder({ estado: 'CANCELADO' }) });
    expect(refundCase.review.evidence.order_state).toBe('REEMBOLSADO');
    expect(cancelledCase.review.evidence.order_state).toBe('CANCELADO');
    expect(refundCase.certification.status).toBe('NOT_CERTIFIED');
  });

  it('detects orphan CFDI and incomplete orders without writing corrections', () => {
    const cfdi = createCfdiRecord({ orderId: 'PED_OTHER', uuid: 'UUID-ORPHAN', total: 50 });
    const result = matchCfdi({ cfdi, order: { id: 'PED_MISSING', total: 50 }, ledgerEntries: [] });
    const fiscalCase = buildFiscalCase({ order: { id: 'PED_MISSING' }, cfdi });
    expect(result.reasons).toEqual(expect.arrayContaining([
      'ORDER_REFERENCE_MISMATCH', 'LEDGER_REFERENCE_MISSING'
    ]));
    expect(fiscalCase.certification.status).toBe('NOT_CERTIFIED');
    expect(fiscalCase.exceptions.length).toBeGreaterThan(0);
  });

  it('retains explicit Nelly commission as ledger evidence without deriving it', () => {
    const entry = buildFinancialEntry({
      tipo: 'COMISION_NELLY', origen: 'contract-test', referencia_id: 'PED_COMMISSION',
      monto: 12, metadata: { source: 'explicit-contract' }
    });
    expect(entry.monto).toBe(12);
    expect(entry.metadata.source).toBe('explicit-contract');
  });

  it('builds an immutable hash chain and detects tampering', () => {
    let history = [];
    history = appendFiscalAuditEvent(history, {
      fiscalCaseId: 'FISCAL_CASE:AUDIT', eventType: 'CASE_CREATED', action: 'CREATE', timestamp: 1
    });
    history = appendFiscalAuditEvent(history, {
      fiscalCaseId: 'FISCAL_CASE:AUDIT', eventType: 'STATUS_CHANGED', action: 'REVIEW',
      previousState: 'PENDING', newState: 'EXCEPTION', timestamp: 2
    });
    expect(Object.isFrozen(history)).toBe(true);
    expect(Object.isFrozen(history[0])).toBe(true);
    expect(verifyFiscalAuditTrail(history)).toMatchObject({ ok: true, length: 2 });
    const tampered = [...history];
    tampered[0] = { ...tampered[0], reason: 'tampered' };
    expect(verifyFiscalAuditTrail(tampered).ok).toBe(false);
  });

  it('requires case, event and action in historical audit events', () => {
    expect(() => createFiscalAuditEvent({ eventType: 'CASE_CREATED', action: 'CREATE' }))
      .toThrow('FISCAL_AUDIT_CASE_REQUIRED');
    expect(() => createFiscalAuditEvent({ fiscalCaseId: 'CASE', action: 'CREATE' }))
      .toThrow('FISCAL_AUDIT_EVENT_REQUIRED');
    expect(() => createFiscalAuditEvent({ fiscalCaseId: 'CASE', eventType: 'CASE_CREATED' }))
      .toThrow('FISCAL_AUDIT_ACTION_REQUIRED');
  });
});
