import { jest } from '@jest/globals';
import request from 'supertest';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-concurrencia-secret';
process.env.REDIS_URL = 'redis://localhost:6379';
process.env.GOOGLE_MAPS_API_KEY = 'test-google-maps';
process.env.RENDER_API_KEY = 'test-render';
process.env.FIREBASE_DATABASE_URL = 'https://mock.firebaseio.test';
process.env.FIREBASE_SERVICE_ACCOUNT = JSON.stringify({
  project_id: 'nelly-test',
  client_email: 'test@nelly.local',
  private_key: '-----BEGIN PRIVATE KEY-----\\ntest\\n-----END PRIVATE KEY-----\\n'
});
process.env.PANEL_ADMIN_EMAILS = 'admin@nellydelivery.com';

let state;
let firestoreEvents;
let transactionChain;

function clone(value) {
  if (value === undefined) return undefined;
  return JSON.parse(JSON.stringify(value));
}

function getAtPath(path) {
  if (!path) return state;
  return String(path).split('/').filter(Boolean).reduce((acc, part) => acc?.[part], state);
}

function setAtPath(path, value) {
  const parts = String(path).split('/').filter(Boolean);
  if (!parts.length) {
    state = value;
    return;
  }
  let cursor = state;
  parts.slice(0, -1).forEach((part) => {
    cursor[part] = cursor[part] && typeof cursor[part] === 'object' ? cursor[part] : {};
    cursor = cursor[part];
  });
  cursor[parts.at(-1)] = value;
}

function updateAtPath(path, updates) {
  if (!path) {
    Object.entries(updates).forEach(([updatePath, value]) => setAtPath(updatePath, value));
    return;
  }
  const current = getAtPath(path) || {};
  setAtPath(path, { ...current, ...updates });
}

function snapshotFor(path) {
  const value = getAtPath(path);
  return {
    exists: () => value !== undefined && value !== null,
    val: () => clone(value)
  };
}

function ref(path = '') {
  return {
    once: async () => snapshotFor(path),
    get: async () => snapshotFor(path),
    set: async (value) => setAtPath(path, clone(value)),
    update: async (updates) => updateAtPath(path, clone(updates)),
    remove: async () => setAtPath(path, null),
    transaction: async (updater) => {
      const run = async () => {
        const current = clone(getAtPath(path));
        const next = updater(current);
        if (next === undefined) {
          return { committed: false, snapshot: snapshotFor(path) };
        }
        setAtPath(path, clone(next));
        return { committed: true, snapshot: snapshotFor(path) };
      };
      transactionChain = transactionChain.then(run, run);
      return transactionChain;
    }
  };
}

const adminMock = {
  apps: [{ name: '[DEFAULT]' }],
  initializeApp: jest.fn(),
  credential: { cert: jest.fn() },
  auth: () => ({
    verifyIdToken: jest.fn(async () => ({
      uid: 'admin-test',
      email: 'admin@nellydelivery.com'
    }))
  }),
  database: () => ({ ref }),
  firestore: () => ({
    collection: (name) => ({
      doc: (id) => ({
        set: async (data) => {
          firestoreEvents.set(`${name}/${id}`, clone(data));
        }
      })
    })
  })
};

jest.unstable_mockModule('firebase-admin', () => ({
  default: adminMock,
  ...adminMock
}));

const { default: app } = await import('../app.js');

describe('Concurrencia real en /api/admin/pedidos/:pedidoId/listo', () => {
  const testId = 'PED_TEST_CONC_99';

  beforeEach(() => {
    state = {
      pedidos: {
        [testId]: {
          id: testId,
          id_pedido: testId,
          estado: 'pendiente',
          version: 0
        }
      },
      pedidos_para_reparto: {},
      order_events_pending: {}
    };
    firestoreEvents = new Map();
    transactionChain = Promise.resolve();
  });

  it('procesa una sola transicion PENDIENTE -> LISTO aunque lleguen dos POST concurrentes', async () => {
    const [res1, res2] = await Promise.all([
      request(app).post(`/api/admin/pedidos/${testId}/listo`).set('Authorization', 'Bearer panel-token'),
      request(app).post(`/api/admin/pedidos/${testId}/listo`).set('Authorization', 'Bearer panel-token')
    ]);

    expect(res1.status).toBe(200);
    expect(res2.status).toBe(200);

    const bodies = [res1.body, res2.body];
    expect(bodies.some((body) => body.alreadyProcessed === true)).toBe(true);
    expect(bodies.every((body) => body.version === 1)).toBe(true);

    expect(state.pedidos[testId].estado).toBe('LISTO');
    expect(state.pedidos[testId].version).toBe(1);
    expect(state.pedidos_para_reparto[testId].version).toBe(1);

    expect(Object.keys(state.order_events_pending)).toHaveLength(1);
    expect(firestoreEvents.size).toBe(1);
    expect([...firestoreEvents.values()][0]).toMatchObject({
      pedido_id: testId,
      evento: 'LISTO_PARA_REPARTO',
      version_pedido: 1
    });
  });
});
