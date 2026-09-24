import { jest } from '@jest/globals';
import request from 'supertest';

const state = {
  dispatch_decisions: {
    order_normal: {
      decision_normal: {
        event_id: 'decision_normal',
        occurred_at: 1000000,
        references: { order_id: 'order_normal', algorithm_id: 'dispatch', algorithm_version: 'dispatch_v1' },
        metadata: {
          decision: 'OFFERED',
          candidate_driver_ids: ['driver_1', 'driver_2'],
          reason_codes: ['PROXIMITY_OBSERVED', 'ROUTE_CONTINUITY_OBSERVED'],
          assignment_factors: { eta_seconds: 600, route_continuity: true },
          human_override: false,
          review_id: null
        }
      }
    },
    order_pending: {
      decision_pending: {
        event_id: 'decision_pending',
        occurred_at: 2000000,
        references: { order_id: 'order_pending', algorithm_id: 'dispatch', algorithm_version: 'dispatch_v2' },
        metadata: {
          decision: 'OFFERED',
          candidate_driver_ids: ['driver_1'],
          reason_codes: ['AVAILABILITY_OBSERVED'],
          assignment_factors: { eta_seconds: 480 },
          human_override: false,
          review_id: null
        }
      }
    }
  },
  work_ledger: {
    driver_1: {
      accepted: { event_id: 'accepted', event_type: 'OFFER_ACCEPTED', actor_id: 'driver_1', occurred_at: 1010000, references: { order_id: 'order_normal', route_id: 'route_1' }, metadata: { estimated_eta_seconds: 600, observed_distance_meters: 3200, route_continuity: true } },
      pickup: { event_id: 'pickup', event_type: 'PICKUP', actor_id: 'driver_1', occurred_at: 1120000, references: { order_id: 'order_normal', route_id: 'route_1' }, metadata: {} },
      delivered: { event_id: 'delivered', event_type: 'DELIVERED', actor_id: 'driver_1', occurred_at: 1600000, references: { order_id: 'order_normal', route_id: 'route_1' }, metadata: {} }
    },
    driver_2: {}
  }
};

function getAt(path) {
  return String(path).split('/').filter(Boolean).reduce((current, part) => current?.[part], state);
}

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    initializeApp: jest.fn(),
    apps: { length: 1 },
    auth: () => ({
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'driver-3') return { uid: 'driver_3', role: 'repartidor' };
        return { uid: 'driver_1', role: 'repartidor' };
      })
    }),
    database: () => ({
      ref: (path = '') => ({ once: jest.fn(async () => ({ val: () => getAt(path) || null })) })
    })
  }
}));

const { default: app } = await import('../app.js');

describe('Operational core integration: P0, 3B and 3C', () => {
  it('preserva evidencia, inteligencia y decision historica sin efectos economicos', async () => {
    const before = structuredClone(state);
    const [p0, intelligence, normalDecision, pendingDecision, metrics] = await Promise.all([
      request(app).get('/api/operational-evidence/drivers/driver_1/work-time-evidence').set('Authorization', 'Bearer driver-1'),
      request(app).get('/api/operational-intelligence/drivers/driver_1/summary').set('Authorization', 'Bearer driver-1'),
      request(app).get('/api/operational-decision-evidence/orders/order_normal/summary').set('Authorization', 'Bearer driver-1'),
      request(app).get('/api/operational-decision-evidence/orders/order_pending/summary').set('Authorization', 'Bearer driver-1'),
      request(app).get('/api/operational-decision-evidence/drivers/driver_1/metrics').set('Authorization', 'Bearer driver-1')
    ]);

    expect(p0.statusCode).toBe(200);
    expect(p0.body).toMatchObject({ writes_performed: false });
    expect(intelligence.statusCode).toBe(200);
    expect(intelligence.body.intelligence).toMatchObject({ writes_performed: false, effects: [] });
    expect(normalDecision.statusCode).toBe(200);
    expect(normalDecision.body.decisions[0]).toMatchObject({
      algorithm_version: 'dispatch_v1',
      candidate_driver_ids: ['driver_1', 'driver_2'],
      reason_codes: ['PROXIMITY_OBSERVED', 'ROUTE_CONTINUITY_OBSERVED'],
      outcome_observed: { outcome_status: 'COMPLETED_OBSERVED' }
    });
    expect(pendingDecision.statusCode).toBe(200);
    expect(pendingDecision.body.decisions[0]).toMatchObject({
      algorithm_version: 'dispatch_v2',
      outcome_observed: { outcome_status: 'PENDING_OR_UNOBSERVED' }
    });
    expect(metrics.statusCode).toBe(200);
    expect(metrics.body.metrics).toMatchObject({
      money: { status: 'NOT_COMPUTED' },
      fiscal: { status: 'NOT_COMPUTED' },
      labor_status: { status: 'NOT_DETERMINED' },
      writes_performed: false,
      effects: []
    });
    expect(JSON.stringify({ p0: p0.body, intelligence: intelligence.body, normalDecision: normalDecision.body, pendingDecision: pendingDecision.body, metrics: metrics.body }))
      .not.toMatch(/base_pay|offer_amount|driver_pay|tip|settlement|tax|ledger/i);
    expect(state).toEqual(before);
  });

  it('bloquea a quien no fue candidato ni es actor privilegiado', async () => {
    const response = await request(app)
      .get('/api/operational-decision-evidence/orders/order_normal/summary')
      .set('Authorization', 'Bearer driver-3');
    expect(response.statusCode).toBe(403);
  });
});
