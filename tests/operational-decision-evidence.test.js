import { jest } from '@jest/globals';
import request from 'supertest';

const state = {
  dispatch_decisions: {
    order_001: {
      decision_001: {
        event_id: 'decision_001',
        occurred_at: 1000000,
        references: { order_id: 'order_001', algorithm_id: 'dispatch', algorithm_version: 'v1' },
        metadata: {
          decision: 'OFFERED',
          candidate_driver_ids: ['driver_1'],
          reason_codes: ['PROXIMITY_OBSERVED'],
          assignment_factors: { distance_meters: 3800, eta_seconds: 600, route_continuity: true },
          human_override: false,
          review_id: null
        }
      }
    }
  },
  work_ledger: {
    driver_1: {
      work_001: { event_id: 'work_001', event_type: 'OFFER_ACCEPTED', actor_id: 'driver_1', occurred_at: 1010000, references: { order_id: 'order_001' } },
      work_002: { event_id: 'work_002', event_type: 'DELIVERED', actor_id: 'driver_1', occurred_at: 1300000, references: { order_id: 'order_001' } }
    }
  }
};
const databaseReads = [];

function getAt(path) {
  return String(path).split('/').filter(Boolean).reduce((current, part) => current?.[part], state);
}

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    initializeApp: jest.fn(),
    apps: { length: 1 },
    auth: () => ({
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'panel-token') return { uid: 'panel_1', panel: true, role: 'panel_cocina' };
        if (token === 'other-token') return { uid: 'driver_2', role: 'repartidor' };
        return { uid: 'driver_1', role: 'repartidor' };
      })
    }),
    database: () => ({
      ref: (path = '') => ({
        once: jest.fn(async () => {
          databaseReads.push(path);
          return { val: () => getAt(path) || null };
        })
      })
    })
  }
}));

const { default: app } = await import('../app.js');

describe('Operational Decision Evidence Sprint 3C', () => {
  it('reconstruye decisiones y resultados observados sin mutar RTDB ni calcular dinero', async () => {
    const before = structuredClone(state);
    databaseReads.length = 0;
    const [summary, metrics] = await Promise.all([
      request(app).get('/api/operational-decision-evidence/orders/order_001/summary').set('Authorization', 'Bearer driver-token'),
      request(app).get('/api/operational-decision-evidence/drivers/driver_1/metrics').set('Authorization', 'Bearer driver-token')
    ]);

    expect(summary.statusCode).toBe(200);
    expect(summary.body).toMatchObject({ writes_performed: false, effects: [] });
    expect(summary.body.decisions[0]).toMatchObject({
      decision_id: 'decision_001',
      algorithm_version: 'v1',
      reason_codes: ['PROXIMITY_OBSERVED'],
      metric_scope: 'RECORDED_DECISION_AND_OBSERVED_EXECUTION_ONLY'
    });
    expect(summary.body.decisions[0].outcome_observed).toMatchObject({
      selected_driver_id_observed: 'driver_1',
      selected_candidate_observed: true,
      completion_observed: true,
      outcome_status: 'COMPLETED_OBSERVED'
    });
    expect(metrics.statusCode).toBe(200);
    expect(metrics.body.metrics).toMatchObject({
      mode: 'READ_ONLY_OPERATIONAL_DECISION_EVIDENCE',
      decision_count_observed: 1,
      accepted_decision_count_observed: 1,
      completed_decision_count_observed: 1,
      completion_rate_observed: 1,
      route_continuity_rate_observed: 1,
      decision_quality_status: 'OBSERVED_OUTCOMES_NOT_ALGORITHMIC_CAUSALITY',
      money: { status: 'NOT_COMPUTED' },
      fiscal: { status: 'NOT_COMPUTED' },
      labor_status: { status: 'NOT_DETERMINED' },
      writes_performed: false,
      effects: []
    });
    expect(databaseReads.sort()).toEqual(['dispatch_decisions', 'dispatch_decisions/order_001', 'work_ledger/driver_1', 'work_ledger/driver_1']);
    expect(state).toEqual(before);
  });

  it('deniega lectura de decisiones a un actor que no es candidato ni privilegiado', async () => {
    const response = await request(app)
      .get('/api/operational-decision-evidence/orders/order_001/summary')
      .set('Authorization', 'Bearer other-token');
    expect(response.statusCode).toBe(403);
  });
});
