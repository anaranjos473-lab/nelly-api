import { describe, expect, it } from '@jest/globals';
import {
  createLegalGate,
  createLegalReview,
  validateLegalReview
} from '../src/services/legalGateService.js';

describe('NELLY-LEGAL LEGAL_GATE', () => {
  const reviewInput = {
    id: 'LEGAL-COMMISSION-001',
    date: '2026-09-23',
    module: 'Nelly Delivery',
    decision: 'Cobrar comisión al comercio',
    participants: ['Nelly', 'Comercio', 'Cliente'],
    facts: ['La comisión aún no tiene contrato aprobado'],
    operationalModel: ['Cliente paga a través de la plataforma'],
    legalFigures: ['Intermediación por confirmar'],
    obligations: ['Definir quién factura y cobra'],
    responsibilities: ['Pendiente de revisión contractual'],
    risks: ['Modelo económico no formalizado'],
    documents: ['Contrato comercio-Nelly'],
    fiscalImplications: ['Revisión fiscal requerida'],
    controls: ['No implementar hasta aprobación'],
    evidence: ['FiscalCase:FISCAL_CASE:1'],
    status: 'ESCALAR',
    riskLevel: 'ALTO',
    escalation: ['Abogado mercantil', 'Fiscalista']
  };

  it('crea una ficha jurídica trazable sin inventar una conclusión', () => {
    const review = createLegalReview(reviewInput);
    expect(review.validation.ok).toBe(true);
    expect(review.review_id).toMatch(/^LEGAL_REVIEW:/);
    expect(review.status).toBe('ESCALAR');
    expect(review.legal_figures).toContain('Intermediación por confirmar');
  });

  it('emite Legal Gate de escalamiento para riesgo alto', () => {
    const gate = createLegalGate({ review: createLegalReview(reviewInput), actor: 'agent-legal' });
    expect(gate.status).toBe('ESCALAR');
    expect(gate.approved).toBe(false);
    expect(gate.requires_external_review).toBe(true);
    expect(gate.evidence).toContain('FiscalCase:FISCAL_CASE:1');
  });

  it('permite una salida condicionada solo cuando la ficha es válida', () => {
    const review = createLegalReview({ ...reviewInput, status: 'VIABLE_CON_CONDICIONES', riskLevel: 'MEDIO' });
    const gate = createLegalGate({ review });
    expect(gate.approved).toBe(true);
    expect(gate.requires_external_review).toBe(false);
  });

  it('mantiene revisión externa para cualquier riesgo alto o crítico', () => {
    const review = createLegalReview({ ...reviewInput, status: 'VIABLE', riskLevel: 'CRITICO' });
    expect(createLegalGate({ review }).requires_external_review).toBe(true);
  });

  it('rechaza estados y niveles de riesgo desconocidos', () => {
    const review = createLegalReview({ ...reviewInput, status: 'APROBADO', riskLevel: 'URGENTE' });
    expect(review.validation.ok).toBe(false);
    expect(review.validation.invalid).toEqual(expect.arrayContaining(['status', 'risk_level']));
    expect(validateLegalReview({}).ok).toBe(false);
  });

  it('conserva la separación entre legal, fiscal, técnico y operativo', () => {
    const review = createLegalReview({ ...reviewInput, status: 'VIABLE_CON_CONDICIONES', riskLevel: 'MEDIO' });
    expect(review).toHaveProperty('fiscal_implications');
    expect(review).toHaveProperty('technical_implications');
    expect(review).toHaveProperty('operational_implications');
    expect(review.source).toBe('NELLY-LEGAL');
  });
});
