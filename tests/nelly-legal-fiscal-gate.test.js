import { describe, expect, it } from '@jest/globals';
import { createLegalReview } from '../src/services/legalGateService.js';
import { buildLegalFiscalGate } from '../src/services/legalFiscalGateService.js';

const legalReview = (status = 'VIABLE_CON_CONDICIONES', riskLevel = 'MEDIO') => createLegalReview({
  id: 'LEGAL-CROSS-1', date: '2026-09-23', module: 'Nelly Delivery',
  decision: 'Revisar flujo económico', participants: ['Nelly', 'Comercio'],
  facts: ['Flujo pendiente de validación externa'], status, riskLevel,
  evidence: ['FiscalCase:FISCAL_CASE:CROSS-1']
});

const certifiedFiscalCase = {
  case_id: 'FISCAL_CASE:CROSS-1',
  certification: { status: 'CERTIFIED' },
  review: { statuses: { fiscal: 'CERTIFIED' } },
  exceptions: []
};

describe('NELLY-LEGAL <-> NELLY-FISCAL cross gate', () => {
  it('requires joint review for a commission with legal escalation and pending fiscal case', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-1', domain: 'COMISION_COMERCIO', legalReview: legalReview('ESCALAR', 'ALTO')
    });
    expect(gate.status).toBe('JOINT_REVIEW_REQUIRED');
    expect(gate.change_control.required).toBe(true);
  });

  it('requires fiscal review when legal is conditionally viable', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-2', domain: 'PAGO_REPARTIDOR', legalReview: legalReview()
    });
    expect(gate.status).toBe('FISCAL_REVIEW_REQUIRED');
  });

  it('blocks a legally blocked refund regardless of fiscal state', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-3', domain: 'REEMBOLSO_CLIENTE', legalReview: legalReview('BLOQUEADO', 'CRITICO'),
      fiscalCase: certifiedFiscalCase
    });
    expect(gate.status).toBe('BLOCKED');
  });

  it('requires legal review only for privacy and geolocation domains', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-4', domain: 'DATOS_GEOLOCALIZACION', legalReview: legalReview('ESCALAR', 'ALTO'), fiscalRequired: false
    });
    expect(gate.status).toBe('LEGAL_REVIEW_REQUIRED');
    expect(gate.fiscal.required).toBe(false);
  });

  it('aligns both gates when external conditions are satisfied', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-5', domain: 'NELLY_LOGISTICS', legalReview: legalReview('VIABLE', 'BAJO'),
      fiscalCase: certifiedFiscalCase
    });
    expect(gate.status).toBe('ALIGNED');
    expect(gate.change_control.action).toBe('NO_CHANGE_REQUIRED');
  });

  it('does not treat a pending fiscal case as a legal defect', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-6', domain: 'NELLY_STORE', legalReview: legalReview('VIABLE', 'MEDIO')
    });
    expect(gate.legal.status).toBe('VIABLE');
    expect(gate.status).toBe('FISCAL_REVIEW_REQUIRED');
  });

  it('preserves the frozen fiscal case reference without modifying it', () => {
    const fiscalCase = structuredClone(certifiedFiscalCase);
    const before = JSON.stringify(fiscalCase);
    buildLegalFiscalGate({ caseId: 'CROSS-7', domain: 'PUBLICIDAD_COMERCIOS', legalReview: legalReview(), fiscalCase });
    expect(JSON.stringify(fiscalCase)).toBe(before);
  });

  it('requires V1.2 plus ADR only as change-control output', () => {
    const gate = buildLegalFiscalGate({
      caseId: 'CROSS-8', domain: 'NELLY_STORE', legalReview: legalReview('RIESGO_JURIDICO', 'ALTO')
    });
    expect(gate.change_control.action).toBe('OPEN_V1_2_ADR_IF_SYSTEM_CHANGE_IS_REQUIRED');
  });
});
