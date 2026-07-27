import {
  DATA_ARCHITECTURE_MODE,
  FIRESTORE_BUSINESS_COLLECTIONS,
  RTDB_ENTITIES,
  TARGET_ARCHITECTURE,
  buildArchitectureHealthScore,
  buildArchitectureIndicators,
  buildDataArchitectureSummary,
  evaluateCoexistence
} from '../src/services/dataArchitectureService.js';

describe('dataArchitectureService', () => {
  test('mantiene el modo seguro del piloto y la arquitectura objetivo', () => {
    expect(DATA_ARCHITECTURE_MODE).toBe('pilot_rtdb_baseline');
    expect(TARGET_ARCHITECTURE.businessPersistence).toBe('firestore');
    expect(TARGET_ARCHITECTURE.liveOperations).toBe('rtdb');
  });

  test('declara entidades criticas de RTDB y Firestore', () => {
    expect(RTDB_ENTITIES.some((entity) => entity.path === 'pedidos')).toBe(true);
    expect(RTDB_ENTITIES.some((entity) => entity.path === 'conductores_activos')).toBe(true);
    expect(FIRESTORE_BUSINESS_COLLECTIONS.some((entity) => entity.collection === 'orders')).toBe(true);
    expect(FIRESTORE_BUSINESS_COLLECTIONS.some((entity) => entity.collection === 'finanzas')).toBe(true);
  });

  test('detecta coexistencia riesgosa de finanzas en RTDB y Firestore', () => {
    const coexistence = evaluateCoexistence({
      rtdb: [{ path: 'finanzas', exists: true }],
      firestore: [{ collection: 'finanzas', exists: true }]
    });
    const finance = coexistence.find((item) => item.id === 'finance_rtdb_firestore');
    expect(finance.triggered).toBe(true);
    expect(finance.severity).toBe('high');
  });

  test('resume estado watch cuando hay duplicidades de advertencia', () => {
    const summary = buildDataArchitectureSummary({
      rtdb: [{ exists: true }],
      firestore: [],
      coexistence: [{ triggered: true, severity: 'warning' }]
    });
    expect(summary.status).toBe('watch');
    expect(summary.warnings).toBe(1);
  });

  test('genera indicadores observables de gobierno de arquitectura', () => {
    const indicators = buildArchitectureIndicators({
      rtdb: [
        { path: 'pedidos', sourceRole: 'pilot_canonical', owner: 'Servicio de Pedidos' },
        { path: 'legacy', sourceRole: 'legacy_projection', owner: 'Pendiente' }
      ],
      firestore: [
        { collection: 'orders', targetRole: 'target_canonical', owner: 'Servicio de Pedidos' }
      ],
      coexistence: [{ triggered: true, severity: 'high' }]
    });

    const critical = indicators.find((item) => item.id === 'critical_duplicities');
    const ownerless = indicators.find((item) => item.id === 'ownerless_services');
    const failedGates = indicators.find((item) => item.id === 'failed_gates');

    expect(critical.value).toBe(1);
    expect(ownerless.value).toBe(1);
    expect(failedGates.value).toBeGreaterThanOrEqual(2);
  });

  test('calcula Architecture Health Score sin ocultar advertencias no criticas', () => {
    const indicators = [
      { id: 'entities_without_ssot', value: 0 },
      { id: 'failed_gates', value: 0 },
      { id: 'ownerless_services', value: 0 },
      { id: 'canonical_entities', value: 100 }
    ];
    const health = buildArchitectureHealthScore({
      indicators,
      summary: { highRiskDuplicities: 0, failedReads: 0 },
      coexistence: [
        { triggered: true, severity: 'warning' },
        { triggered: true, severity: 'warning' },
        { triggered: false, severity: 'ok' }
      ]
    });

    expect(health.score).toBe(96);
    expect(health.label).toBe('Excelente');
    expect(health.components.find((item) => item.id === 'duplicities').value).toBe(16);
  });
});
