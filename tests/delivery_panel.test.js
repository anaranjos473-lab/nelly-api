import { jest } from '@jest/globals';
import request from 'supertest';

const state = {
  repartidores: {
    driver_ok: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 100, limite_deuda: 300, saldo_ganancias: 0 }
    },
    driver_blocked: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: true },
      finanzas: { deuda_actual: 301, limite_deuda: 300, saldo_ganancias: 0 }
    }
  },
  pedidos_para_reparto: {
    pedido_ok: { id_pedido: 'pedido_ok', estado: 'LISTO', monto_total: 120 }
  },
  pedidos_en_camino: {}
};

function pathParts(path = '') {
  return String(path).split('/').filter(Boolean);
}

function getAt(path) {
  return pathParts(path).reduce((current, part) => current?.[part], state);
}

function setAt(path, value) {
  const parts = pathParts(path);
  const last = parts.pop();
  const parent = parts.reduce((current, part) => {
    current[part] = current[part] || {};
    return current[part];
  }, state);
  parent[last] = value;
}

function updateAt(path, value) {
  if (!path) {
    Object.entries(value).forEach(([key, val]) => setAt(key, val));
    return;
  }
  const current = getAt(path) || {};
  setAt(path, { ...current, ...value });
}

function removeAt(path) {
  const parts = pathParts(path);
  const last = parts.pop();
  const parent = parts.reduce((current, part) => current?.[part], state);
  if (parent && last) {
    delete parent[last];
  }
}

jest.unstable_mockModule('firebase-admin', () => ({
  default: {
    initializeApp: jest.fn(),
    apps: { length: 1 },
    auth: () => ({
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'panel-token') {
          return { uid: 'admin_panel', admin: true, email: 'admin@nellydelivery.com' };
        }
        if (token === 'blocked-token') {
          return { uid: 'driver_blocked', admin: false };
        }
        return { uid: 'driver_ok', admin: false };
      })
    }),
    database: () => ({
      ref: (path = '') => ({
        once: jest.fn(async () => ({
          val: () => getAt(path),
          exists: () => getAt(path) !== undefined && getAt(path) !== null
        })),
        set: jest.fn(async (value) => setAt(path, value)),
        update: jest.fn(async (value) => updateAt(path, value)),
        remove: jest.fn(async () => removeAt(path)),
        transaction: jest.fn(async (updater) => {
          const current = getAt(path);
          const next = updater(current);
          if (next === undefined) {
            return { committed: false, snapshot: { exists: () => false, val: () => null } };
          }
          setAt(path, next);
          return { committed: true, snapshot: { exists: () => true, val: () => next } };
        })
      })
    }),
    firestore: () => ({
      collection: () => ({ get: async () => ({ docs: [] }) })
    })
  }
}));

const { default: app } = await import('../app.js');

describe('Delivery y panel API', () => {
  it('acepta un pedido disponible para un repartidor sin bloqueo', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos_en_camino.pedido_ok.repartidor_id).toBe('driver_ok');
  });

  it('rechaza aceptar pedido si el repartidor esta bloqueado por deuda', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer blocked-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(403);
    expect(String(res.body.error).toLowerCase()).toContain('deuda');
  });

  it('actualiza ubicacion del repartidor autenticado', async () => {
    const res = await request(app)
      .post('/api/delivery/update-location')
      .set('Authorization', 'Bearer driver-token')
      .send({ lat: 16.75, lng: -93.11, pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(state.repartidores.driver_ok.ubicacion.lat).toBe(16.75);
    expect(state.conductores_activos.driver_ok.lng).toBe(-93.11);
  });

  it('protege driver-offline cuando falta token', async () => {
    const res = await request(app)
      .post('/api/delivery/driver-offline')
      .send({});

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });

  it('marca offline al repartidor autenticado y remueve presencia activa', async () => {
    state.conductores_activos = {
      driver_ok: { lat: 16.75, lng: -93.11, estado: 'DISPONIBLE' }
    };

    const res = await request(app)
      .post('/api/delivery/driver-offline')
      .set('Authorization', 'Bearer driver-token')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.repartidores.driver_ok.disponible).toBe(false);
    expect(state.repartidores.driver_ok.estado).toBe('OFFLINE');
    expect(state.conductores_activos.driver_ok).toBeNull();
  });

  it('registra pago de deuda desde panel', async () => {
    const res = await request(app)
      .post('/api/panel/finanzas/registrar-pago-deuda')
      .set('Authorization', 'Bearer panel-token')
      .send({ uid: 'driver_blocked', monto_pago: 301 });

    expect(res.statusCode).toBe(200);
    expect(res.body.bloqueadoPorDeuda).toBe(false);
    expect(state.repartidores.driver_blocked.finanzas.deuda_actual).toBe(0);
  });

  it('protege complete-order cuando falta token', async () => {
    const res = await request(app)
      .post('/api/delivery/complete-order')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });

  it('rechaza complete-order si usuario no es admin/panel', async () => {
    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('No autorizado');
  });

  it('completa un pedido cuando admin tiene token valido', async () => {
    state.pedidos_en_camino.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'EN_CAMINO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer panel-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.pedidoId).toBe('pedido_ok');
    expect(state.pedidos_en_camino.pedido_ok.estado).toBe('ENTREGADO');
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
  });
});
