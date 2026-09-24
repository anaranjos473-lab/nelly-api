import { jest } from '@jest/globals';
import request from 'supertest';

const state = {
  work_ledger: {
    driver_1: {
      work_001: { event_id: 'work_001', event_type: 'OFFER_ACCEPTED', occurred_at: 1000000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: { estimated_eta_seconds: 600, observed_distance_meters: 3800, route_continuity: true } },
      work_002: { event_id: 'work_002', event_type: 'ARRIVED_MERCHANT', occurred_at: 1120000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: {} },
      work_003: { event_id: 'work_003', event_type: 'ORDER_READY', occurred_at: 1300000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: {} },
      work_004: { event_id: 'work_004', event_type: 'PICKUP', occurred_at: 1360000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: {} },
      work_005: { event_id: 'work_005', event_type: 'ARRIVED_DROPOFF', occurred_at: 1600000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: {} },
      work_006: { event_id: 'work_006', event_type: 'DELIVERED', occurred_at: 1660000, references: { order_id: 'order_001', route_id: 'route_001' }, metadata: {} },
      work_007: { event_id: 'work_007', event_type: 'OFFER_ACCEPTED', occurred_at: 1700000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: { estimated_eta_seconds: 400, observed_distance_meters: 4800, route_continuity: true } },
      work_008: { event_id: 'work_008', event_type: 'ARRIVED_MERCHANT', occurred_at: 1800000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: {} },
      work_009: { event_id: 'work_009', event_type: 'ORDER_READY', occurred_at: 1810000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: {} },
      work_010: { event_id: 'work_010', event_type: 'PICKUP', occurred_at: 1820000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: {} },
      work_011: { event_id: 'work_011', event_type: 'ARRIVED_DROPOFF', occurred_at: 2000000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: {} },
      work_012: { event_id: 'work_012', event_type: 'DELIVERED', occurred_at: 2100000, references: { order_id: 'order_002', route_id: 'route_001' }, metadata: {} }
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

describe('Operational Intelligence Sprint 3B', () => {
  it('deriva tiempo, ruta, ETA y OPH desde evidencia P0 sin mutaciones', async () => {
    const before = structuredClone(state);
    databaseReads.length = 0;
    const [summary, routes, bottlenecks, eta] = await Promise.all([
      request(app).get('/api/operational-intelligence/drivers/driver_1/summary').set('Authorization', 'Bearer driver-token'),
      request(app).get('/api/operational-intelligence/drivers/driver_1/route-productivity').set('Authorization', 'Bearer driver-token'),
      request(app).get('/api/operational-intelligence/drivers/driver_1/bottlenecks').set('Authorization', 'Bearer driver-token'),
      request(app).get('/api/operational-intelligence/drivers/driver_1/eta-accuracy').set('Authorization', 'Bearer driver-token')
    ]);

    expect(summary.statusCode).toBe(200);
    expect(summary.body.intelligence).toMatchObject({
      mode: 'READ_ONLY_OPERATIONAL_ANALYTICS',
      writes_performed: false,
      effects: [],
      money: { status: 'NOT_COMPUTED' },
      fiscal: { status: 'NOT_COMPUTED' },
      labor_status: { status: 'NOT_DETERMINED' }
    });
    expect(summary.body.intelligence.time_quality[0]).toMatchObject({
      order_id: 'order_001',
      travel_to_pickup_seconds_observed: 120,
      merchant_wait_seconds_observed: 180,
      pickup_handoff_seconds_observed: 60,
      pickup_to_dropoff_seconds_observed: 240,
      dropoff_handoff_seconds_observed: 60,
      total_effective_seconds_observed: 660,
      eta_deviation_seconds_observed: 60,
      eta_accuracy_ratio_observed: 0.9
    });
    expect(routes.statusCode).toBe(200);
    expect(routes.body.routes[0]).toMatchObject({
      route_id: 'route_001',
      route_order_count: 2,
      completed_order_count: 2,
      observed_distance_meters: 4800,
      observed_distance_per_order_meters: 2400,
      route_continuity_observed: true,
      metric_scope: 'OBSERVED_ROUTE_PRODUCTIVITY_ONLY'
    });
    expect(bottlenecks.statusCode).toBe(200);
    expect(bottlenecks.body.bottlenecks[0]).toMatchObject({
      order_id: 'order_001',
      longest_observed_stage: { stage: 'PICKUP_TO_DROPOFF_OBSERVED', seconds: 240 },
      attribution: 'NOT_DETERMINED',
      unobserved_categories: ['CUSTOMER_DELAY', 'SYSTEM_DELAY']
    });
    expect(eta.statusCode).toBe(200);
    expect(eta.body.eta[0]).toMatchObject({
      order_id: 'order_001',
      eta_estimated_seconds_observed: 600,
      eta_actual_seconds_observed: 660,
      eta_deviation_seconds_observed: 60,
      eta_accuracy_ratio_observed: 0.9
    });
    expect(databaseReads).toEqual(['work_ledger/driver_1', 'work_ledger/driver_1', 'work_ledger/driver_1', 'work_ledger/driver_1']);
    expect(state).toEqual(before);
  });

  it('no permite lectura de inteligencia operacional de otro repartidor', async () => {
    const response = await request(app)
      .get('/api/operational-intelligence/drivers/driver_1/summary')
      .set('Authorization', 'Bearer other-token');

    expect(response.statusCode).toBe(403);
  });
});
