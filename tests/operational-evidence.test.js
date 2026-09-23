import { jest } from '@jest/globals';
import request from 'supertest';

const state = {};
const databaseReads = [];

function parts(path = '') {
  return String(path).split('/').filter(Boolean);
}

function getAt(path) {
  return parts(path).reduce((current, part) => current?.[part], state);
}

function setAt(path, value) {
  const pathParts = parts(path);
  const last = pathParts.pop();
  const parent = pathParts.reduce((current, part) => {
    current[part] = current[part] || {};
    return current[part];
  }, state);
  parent[last] = value;
}

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    initializeApp: jest.fn(),
    apps: { length: 1 },
    auth: () => ({
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'panel-token') return { uid: 'panel_1', panel: true, role: 'panel_cocina' };
        return { uid: 'driver_1', role: 'repartidor' };
      })
    }),
    database: () => ({
      ref: (path = '') => ({
        once: jest.fn(async () => {
          databaseReads.push(path);
          return { val: () => getAt(path) || null };
        }),
        transaction: jest.fn(async (updater) => {
          const next = updater(getAt(path));
          if (next === undefined) return { committed: false, snapshot: { val: () => null } };
          setAt(path, next);
          return { committed: true, snapshot: { val: () => next } };
        })
      })
    })
  }
}));

const { default: app } = await import('../app.js');

describe('Operational evidence Sprint 1', () => {
  it('registra evidencia de trabajo idempotente y calcula un resumen sin dinero', async () => {
    const payload = { event_id: 'work_001', event_type: 'CONNECTED', occurred_at: 1700000000000 };
    const first = await request(app).post('/api/operational-evidence/work-events').set('Authorization', 'Bearer driver-token').send(payload);
    const retry = await request(app).post('/api/operational-evidence/work-events').set('Authorization', 'Bearer driver-token').send(payload);
    const summary = await request(app).get('/api/operational-evidence/drivers/driver_1/work-summary').set('Authorization', 'Bearer driver-token');

    expect(first.statusCode).toBe(201);
    expect(first.body.event.event_type).toBe('CONNECTED');
    expect(retry.statusCode).toBe(201);
    expect(retry.body.idempotent).toBe(true);
    expect(summary.statusCode).toBe(200);
    expect(summary.body.summary.event_count).toBe(1);
    expect(summary.body.summary).not.toHaveProperty('payment');

    const conflict = await request(app)
      .post('/api/operational-evidence/work-events')
      .set('Authorization', 'Bearer driver-token')
      .send({ ...payload, event_type: 'AVAILABLE' });
    expect(conflict.statusCode).toBe(409);

    await request(app)
      .post('/api/operational-evidence/work-events')
      .set('Authorization', 'Bearer driver-token')
      .send({ event_id: 'work_002', event_type: 'OFFER_ACCEPTED', occurred_at: 1700000060000, order_id: 'order_001' });
    await request(app)
      .post('/api/operational-evidence/work-events')
      .set('Authorization', 'Bearer driver-token')
      .send({ event_id: 'work_003', event_type: 'DELIVERED', occurred_at: 1700000120000, order_id: 'order_001' });

    const productivity = await request(app)
      .get('/api/operational-evidence/drivers/driver_1/productivity')
      .set('Authorization', 'Bearer driver-token');
    const stateBeforeSimulation = structuredClone(state);
    databaseReads.length = 0;
    const simulation = await request(app)
      .get('/api/operational-evidence/drivers/driver_1/status-simulation')
      .set('Authorization', 'Bearer driver-token');

    expect(productivity.statusCode).toBe(200);
    expect(productivity.body.productivity.delivered_orders).toBe(1);
    expect(productivity.body.productivity).not.toHaveProperty('payment');
    expect(simulation.statusCode).toBe(200);
    expect(simulation.body.simulation.mode).toBe('CALCULATION_ONLY');
    expect(simulation.body.simulation.writes_performed).toBe(false);
    expect(simulation.body.simulation.effects).toEqual([]);
    expect(databaseReads).toEqual(['work_ledger/driver_1']);
    expect(state).toEqual(stateBeforeSimulation);
  });

  it('registra version y evidencia de dispatch sin adjudicar el pedido', async () => {
    const version = await request(app)
      .post('/api/operational-evidence/algorithm-versions')
      .set('Authorization', 'Bearer panel-token')
      .send({ algorithm_id: 'dispatch', version: 'v1', effective_from: 1700000000000, criteria: { proximity: 'observed' }, change_reason: 'initial audit version' });
    const decision = await request(app)
      .post('/api/operational-evidence/dispatch-decisions')
      .set('Authorization', 'Bearer panel-token')
      .send({
        order_id: 'order_001',
        decision_id: 'decision_001',
        algorithm_id: 'dispatch',
        algorithm_version: 'v1',
        decision: 'OFFERED',
        candidate_driver_ids: ['driver_1'],
        reason_codes: ['PROXIMITY_OBSERVED'],
        assignment_factors: { proximity_band: 'near', capacity_available: true }
      });
    const evidence = await request(app).get('/api/operational-evidence/orders/order_001/dispatch-evidence').set('Authorization', 'Bearer driver-token');

    expect(version.statusCode).toBe(201);
    expect(decision.statusCode).toBe(201);
    expect(evidence.statusCode).toBe(200);
    expect(evidence.body.decisions).toHaveLength(1);
    expect(evidence.body.decisions[0].metadata.decision).toBe('OFFERED');
    expect(evidence.body.decisions[0].metadata.reason_codes).toEqual(['PROXIMITY_OBSERVED']);
    expect(state.pedidos).toBeUndefined();
  });

  it('mantiene la revision humana como expediente no ejecutivo', async () => {
    const created = await request(app)
      .post('/api/operational-evidence/reviews')
      .set('Authorization', 'Bearer driver-token')
      .send({ review_id: 'review_001', subject_type: 'DISPATCH_DECISION', subject_id: 'decision_001', reason: 'Solicitud de explicacion' });
    const decided = await request(app)
      .post('/api/operational-evidence/reviews/review_001/decisions')
      .set('Authorization', 'Bearer panel-token')
      .send({ decision_id: 'review_decision_001', outcome: 'CLOSED_NO_ACTION', rationale: 'Evidencia revisada; sin accion ejecutiva.' });

    expect(created.statusCode).toBe(201);
    expect(decided.statusCode).toBe(201);
    expect(decided.body.review.status).toBe('CLOSED');
    expect(decided.body.review.decisions.review_decision_001.outcome).toBe('CLOSED_NO_ACTION');
  });

  it('prepara evidencia de cumplimiento sin calcular dinero, fiscal ni estado laboral', async () => {
    const before = structuredClone(state);
    databaseReads.length = 0;
    const result = await request(app)
      .get('/api/operational-evidence/drivers/driver_1/compliance-readiness')
      .set('Authorization', 'Bearer driver-token');

    expect(result.statusCode).toBe(200);
    expect(result.body.readiness.mode).toBe('READ_ONLY_PREPARATION');
    expect(result.body.readiness.writes_performed).toBe(false);
    expect(result.body.readiness.work_time.tasks[0]).toMatchObject({
      order_id: 'order_001',
      task_accepted_at: 1700000060000,
      task_completed_at: 1700000120000,
      effective_work_seconds_observed: 60
    });
    expect(result.body.readiness.algorithmic_management.decisions[0]).toMatchObject({
      decision_id: 'decision_001',
      reason_codes: ['PROXIMITY_OBSERVED'],
      assignment_factors: { proximity_band: 'near', capacity_available: true }
    });
    expect(result.body.readiness.earnings.status).toBe('NOT_COMPUTED');
    expect(result.body.readiness.weekly_statement.status).toBe('NOT_ISSUED');
    expect(result.body.readiness.fiscal.status).toBe('NOT_COMPUTED');
    expect(databaseReads.sort()).toEqual(['dispatch_decisions', 'human_reviews', 'work_ledger/driver_1']);
    expect(state).toEqual(before);
  });

  it('resume desempeno de comercio sin incluir dinero ni permitir lectura al repartidor', async () => {
    state.pedidos = {
      order_001: { comercio_id: 'merchant_001', estado: 'ENTREGADO' },
      order_002: { comercio_id: 'merchant_001', estado: 'CANCELADO' },
      order_003: { comercio_id: 'merchant_002', estado: 'ENTREGADO' }
    };

    const allowed = await request(app)
      .get('/api/operational-evidence/merchants/merchant_001/performance')
      .set('Authorization', 'Bearer panel-token');
    const denied = await request(app)
      .get('/api/operational-evidence/merchants/merchant_001/performance')
      .set('Authorization', 'Bearer driver-token');

    expect(allowed.statusCode).toBe(200);
    expect(allowed.body.performance.orders_total).toBe(2);
    expect(allowed.body.performance.orders_delivered).toBe(1);
    expect(allowed.body.performance).not.toHaveProperty('revenue');
    expect(denied.statusCode).toBe(403);
  });
});
