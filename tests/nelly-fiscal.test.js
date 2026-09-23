import { describe, expect, it } from '@jest/globals';
import { buildFiscalOrderReview, classifyOrder } from '../src/services/nellyFiscalService.js';
import { createFinancialEvent, validateFinancialEvent } from '../src/domain/contracts/financialEvent.js';
import { createFiscalRule, evaluateFiscalRule } from '../src/services/fiscalRulesService.js';
import { createCfdiRecord, matchCfdi, transitionCfdi } from '../src/services/cfdiLifecycleService.js';
import { buildFiscalCase, buildFiscalControlCenter } from '../src/services/fiscalCaseService.js';

describe('NELLY-FISCAL', () => {
  it('separa GMV de ingreso Nelly y deja el tratamiento fiscal pendiente', () => {
    const review = classifyOrder({
      id: 'PED_1',
      cliente_nombre: 'Angel',
      comercio_id: 'commerce-1',
      subtotal: 235,
      costo_envio: 45,
      propina: 0,
      total: 280,
      pago: { metodo: 'efectivo' },
      created_at: 1788728750441,
      estado: 'EN_CURSO'
    });

    expect(review.amounts.gmv).toBe(280);
    expect(review.amounts.nelly_revenue).toBeNull();
    expect(review.amounts.third_party_amount).toBeNull();
    expect(review.statuses.fiscal).toBe('FISCAL_PENDING');
    expect(review.risks).toContain('OWNERSHIP_OF_CUSTOMER_MONEY_NOT_CONFIRMED');
  });

  it('marca excepcion cuando faltan hechos operativos o los importes no cuadran', () => {
    const review = classifyOrder({
      id: 'PED_2',
      subtotal: 100,
      costo_envio: 20,
      propina: 0,
      total: 150
    });

    expect(review.state).toBe('EXCEPTION');
    expect(review.missing).toEqual(expect.arrayContaining([
      'payment_method',
      'commerce_id',
      'customer_identity',
      'operation_timestamp'
    ]));
    expect(review.warnings).toContain('TOTAL_DOES_NOT_MATCH_COMPONENTS');
  });

  it('reconoce movimientos del ledger sin crear una segunda fuente de verdad', () => {
    const review = buildFiscalOrderReview({
      order: {
        id: 'PED_3',
        cliente_nombre: 'Cliente',
        comercio_id: 'commerce-1',
        subtotal: 100,
        costo_envio: 20,
        propina: 0,
        total: 120,
        pago: { metodo: 'efectivo' },
        created_at: 1
      },
      ledgerEntries: [{ referencia_id: 'PED_3', tipo: 'COBRO_EFECTIVO', monto: 120 }]
    });

    expect(review.evidence.ledger_entries).toBe(1);
    expect(review.statuses.accounting).toBe('ACCOUNTED');
  });

  it('crea y valida un FinancialEvent idempotente', () => {
    const event = createFinancialEvent({
      event_type: 'FINANCIAL_EVENT_CREATED',
      operation_id: 'PED_EVENT_1',
      gross_amount: 100,
      idempotency_key: 'FINANCIAL_EVENT_CREATED:PED_EVENT_1'
    });
    expect(event.validation.ok).toBe(true);
    expect(event.event_id).toContain('FINANCIAL_EVENT_CREATED:PED_EVENT_1');
    expect(validateFinancialEvent({}).ok).toBe(false);
  });

  it('mantiene una regla fiscal como pendiente sin aplicar una tasa', () => {
    const rule = createFiscalRule({ id: 'RULE-IVA-1', operationType: 'COMMISSION', tax: 'IVA', rate: 0.16 });
    const result = evaluateFiscalRule(rule);
    expect(result.status).toBe('RULE_PENDING_VALIDATION');
    expect(result.taxAmount).toBeNull();
  });

  it('controla transiciones CFDI y detecta falta de conciliacion', () => {
    const cfdi = createCfdiRecord({ orderId: 'PED_CFDI_1', total: 100 });
    const received = transitionCfdi(cfdi, 'RECEIVED', { uuid: 'uuid-1' });
    expect(received.status).toBe('RECEIVED');
    expect(matchCfdi({
      cfdi: received,
      order: { id: 'PED_CFDI_1', total: 100 },
      ledgerEntries: []
    })).toEqual({ matched: false, reasons: ['LEDGER_REFERENCE_MISSING'] });
  });

  it('construye expediente y resumen sin certificar automaticamente', () => {
    const fiscalCase = buildFiscalCase({
      order: {
        id: 'PED_CASE_1', cliente_nombre: 'Cliente', comercio_id: 'c-1',
        subtotal: 100, costo_envio: 20, propina: 0, total: 120,
        pago: { metodo: 'efectivo' }, created_at: 1
      },
      ledgerEntries: [{ referencia_id: 'PED_CASE_1', tipo: 'COBRO_EFECTIVO', monto: 120 }]
    });
    const summary = buildFiscalControlCenter([fiscalCase]);
    expect(fiscalCase.certification.status).toBe('NOT_CERTIFIED');
    expect(summary.totals.gmv).toBe(120);
    expect(summary.certification).toBe('NOT_CERTIFIED');
  });

  it.each([
    ['missing event type', { operation_id: 'PED_1', idempotency_key: 'K1' }],
    ['missing operation', { event_type: 'ORDER_CREATED', idempotency_key: 'K2' }],
    ['missing idempotency', { event_type: 'ORDER_CREATED', operation_id: 'PED_2' }]
  ])('rechaza FinancialEvent incompleto: %s', (_label, input) => {
    expect(createFinancialEvent(input).validation.ok).toBe(false);
  });

  it('rechaza importes negativos en FinancialEvent', () => {
    expect(createFinancialEvent({
      event_type: 'ORDER_CREATED', operation_id: 'PED_NEG',
      gross_amount: -1, idempotency_key: 'NEG'
    }).validation.invalid_amounts).toContain('gross_amount');
  });

  it('rechaza tasas fiscales invalidas', () => {
    expect(() => createFiscalRule({ id: 'RULE_BAD', operationType: 'X', tax: 'Y', rate: -1 })).toThrow('FISCAL_RULE_RATE_INVALID');
  });

  it('aplica una regla validada sin calcular impuestos por cuenta propia', () => {
    const rule = createFiscalRule({ id: 'RULE_OK', operationType: 'X', tax: 'Y', rate: 0.16, validationStatus: 'VALIDATED_RULE' });
    expect(evaluateFiscalRule(rule).status).toBe('RULE_APPLICABLE');
    expect(evaluateFiscalRule(rule).taxAmount).toBeNull();
  });

  it('marca una regla validada fuera de vigencia', () => {
    const rule = createFiscalRule({ id: 'RULE_OLD', operationType: 'X', tax: 'Y', validationStatus: 'VALIDATED_RULE', effectiveTo: 1 });
    expect(evaluateFiscalRule(rule, { asOf: 2 }).status).toBe('RULE_OUT_OF_EFFECT');
  });

  it('rechaza una transicion CFDI no permitida', () => {
    const cfdi = createCfdiRecord({ orderId: 'PED_BAD_TRANSITION' });
    expect(() => transitionCfdi(cfdi, 'CONCILIATED')).toThrow('CFDI_TRANSITION_INVALID');
  });

  it('detecta diferencia de total CFDI', () => {
    const cfdi = createCfdiRecord({ orderId: 'PED_TOTAL', total: 99, uuid: 'u-1' });
    expect(matchCfdi({
      cfdi: { ...cfdi, status: 'RECEIVED' },
      order: { id: 'PED_TOTAL', total: 100 },
      ledgerEntries: [{ referencia_id: 'PED_TOTAL' }]
    }).reasons).toContain('TOTAL_MISMATCH');
  });

  it('detecta settlement con referencia diferente', () => {
    const cfdi = createCfdiRecord({ orderId: 'PED_SETTLE', uuid: 'u-2', total: 10 });
    expect(matchCfdi({
      cfdi: { ...cfdi, status: 'RECEIVED' },
      order: { id: 'PED_SETTLE', total: 10 },
      ledgerEntries: [{ referencia_id: 'PED_SETTLE' }],
      settlement: { order_id: 'PED_OTHER' }
    }).reasons).toContain('SETTLEMENT_REFERENCE_MISMATCH');
  });

  it('marca CFDI pendiente cuando el pedido no trae comprobante', () => {
    const fiscalCase = buildFiscalCase({ order: { id: 'PED_NO_CFDI', total: 1 } });
    expect(fiscalCase.cfdi.status).toBe('PENDING');
    expect(fiscalCase.cfdi_match.matched).toBe(false);
  });

  it('conserva excepciones unicas en el expediente', () => {
    const fiscalCase = buildFiscalCase({ order: { id: 'PED_DUP_EX', total: 1 } });
    expect(new Set(fiscalCase.exceptions).size).toBe(fiscalCase.exceptions.length);
  });

  it('mantiene GMV cero cuando no hay ingreso Nelly determinado', () => {
    const summary = buildFiscalControlCenter([buildFiscalCase({ order: { id: 'PED_ZERO', total: 0 } })]);
    expect(summary.totals.gmv).toBe(0);
    expect(summary.totals.nelly_revenue).toBe(0);
  });
});
