import { jest } from '@jest/globals';
import request from 'supertest';

const state = {
  repartidores: {
    driver_ok: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 100, limite_deuda: 300, saldo_ganancias: 0 },
      billetera: { billetera_guerra: 1000 },
      equipamiento: { caja_grande: true, tensor: true, mochila_termica: true }
    },
    driver_blocked: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: true },
      finanzas: { deuda_actual: 301, limite_deuda: 300, saldo_ganancias: 0 }
    },
    driver_low_capital: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 0, limite_deuda: 300, saldo_ganancias: 0 },
      billetera: { billetera_guerra: 300 },
      equipamiento: { caja_grande: true, tensor: true, mochila_termica: true }
    },
    driver_no_equipment: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 0, limite_deuda: 300, saldo_ganancias: 0 },
      billetera: { billetera_guerra: 1000 },
      equipamiento: { caja_grande: true, tensor: false, mochila_termica: true }
    },
    driver_far: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 0, limite_deuda: 300, saldo_ganancias: 0 },
      billetera: { billetera_guerra: 1000 },
      equipamiento: { caja_grande: true, tensor: true, mochila_termica: true },
      ubicacion: { lat: 16.86, lng: -93.22 }
    },
    driver_reserved_capital: {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 0, limite_deuda: 300, saldo_ganancias: 0 },
      billetera: { billetera_guerra: 1000, capital_reservado: 700 },
      equipamiento: { caja_grande: true, tensor: true, mochila_termica: true },
      ubicacion: { lat: 16.7528, lng: -93.1167 }
    }
  },
  pedidos_para_reparto: {
    pedido_ok: { id_pedido: 'pedido_ok', estado: 'LISTO', monto_total: 120 },
    pedido_alto: { id_pedido: 'pedido_alto', estado: 'LISTO', monto_total: 850 },
    pedido_tensor: { id_pedido: 'pedido_tensor', estado: 'LISTO', monto_total: 120, requiere_tensor: true },
    pedido_radio: {
      id_pedido: 'pedido_radio',
      estado: 'LISTO',
      monto_total: 120,
      maxDistanceKm: 5,
      cliente: { coords: { lat: 16.7527, lng: -93.1167 } }
    },
    pedido_reserva: { id_pedido: 'pedido_reserva', estado: 'LISTO', monto_total: 500 }
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
  if (value === null) {
    delete parent[last];
    return;
  }
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
      verifyIdToken: jest.fn(async (token) => ({
        uid: token === 'blocked-token'
          ? 'driver_blocked'
          : (token === 'low-capital-token'
            ? 'driver_low_capital'
            : (token === 'no-equipment-token'
              ? 'driver_no_equipment'
              : (token === 'far-token'
                ? 'driver_far'
                : (token === 'reserved-capital-token' ? 'driver_reserved_capital' : 'driver_ok')))),
        admin: token === 'panel-token'
      }))
    }),
    database: () => ({
      ref: (path = '') => {
        const makeRef = (refPath = '') => ({
          child: jest.fn((childPath) => makeRef([refPath, childPath].filter(Boolean).join('/'))),
          once: jest.fn(async () => ({
            val: () => getAt(refPath),
            exists: () => getAt(refPath) !== undefined && getAt(refPath) !== null
          })),
          set: jest.fn(async (value) => setAt(refPath, value)),
          update: jest.fn(async (value) => updateAt(refPath, value)),
          remove: jest.fn(async () => removeAt(refPath)),
          transaction: jest.fn(async (updater) => {
            const current = getAt(refPath);
            const next = updater(current);
            if (next === undefined) {
              return { committed: false, snapshot: { exists: () => false, val: () => null } };
            }
            setAt(refPath, next);
            return { committed: true, snapshot: { exists: () => true, val: () => next } };
          })
        });
        return makeRef(path);
      }
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
    expect(res.body.montoReservado).toBe(120);
    expect(res.body.elegibilidad.dispatchScore).toBeGreaterThan(0);
    expect(state.pedidos_en_camino.pedido_ok.repartidor_id).toBe('driver_ok');
    expect(state.pedidos_en_camino.pedido_ok.idConductor).toBe('driver_ok');
    expect(state.pedidos_en_camino.pedido_ok.id_pedido).toBe('pedido_ok');
    expect(state.pedidos_en_camino.pedido_ok.monto_total).toBe(120);
    expect(state.pedidos.pedido_ok.id_pedido).toBe('pedido_ok');
    expect(state.pedidos.pedido_ok.monto_total).toBe(120);
    expect(state.pedidos_en_camino.pedido_ok.capital_reserva.monto).toBe(120);
    expect(state.repartidores.driver_ok.billetera.capital_reservado).toBe(120);
    expect(state.repartidores.driver_ok.billetera.capital_disponible).toBe(880);
  });

  it('libera capital reservado al completar pedido', async () => {
    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos_en_camino.pedido_ok.capital_reserva.estado).toBe('liberada');
    expect(state.repartidores.driver_ok.billetera.capital_reservado).toBe(0);
    expect(state.repartidores.driver_ok.billetera.capital_disponible).toBe(1000);
    expect(state.repartidores.driver_ok.pedido_activo).toBeUndefined();
  });

  it('rechaza aceptar pedido si no alcanza billetera de guerra', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer low-capital-token')
      .send({ pedidoId: 'pedido_alto' });

    expect(res.statusCode).toBe(403);
    expect(res.body.faltantes).toContain('billetera_guerra');
    expect(state.pedidos_en_camino.pedido_alto).toBeUndefined();
  });

  it('rechaza aceptar pedido si falta equipamiento requerido', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer no-equipment-token')
      .send({ pedidoId: 'pedido_tensor' });

    expect(res.statusCode).toBe(403);
    expect(res.body.faltantes).toContain('tensor');
    expect(state.pedidos_en_camino.pedido_tensor).toBeUndefined();
  });

  it('rechaza aceptar pedido si el repartidor esta fuera del radio permitido', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer far-token')
      .send({ pedidoId: 'pedido_radio' });

    expect(res.statusCode).toBe(403);
    expect(res.body.faltantes).toContain('radio_km');
    expect(res.body.elegibilidad.distanciaKm).toBeGreaterThan(5);
    expect(state.pedidos_en_camino.pedido_radio).toBeUndefined();
  });

  it('usa capital disponible descontando reservas antes de aceptar', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer reserved-capital-token')
      .send({ pedidoId: 'pedido_reserva' });

    expect(res.statusCode).toBe(403);
    expect(res.body.faltantes).toContain('billetera_guerra');
    expect(res.body.elegibilidad.billeteraGuerra).toBe(300);
    expect(state.pedidos_en_camino.pedido_reserva).toBeUndefined();
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

  it('elimina al repartidor de conductores_activos al marcar offline', async () => {
    state.conductores_activos = {
      driver_ok: { lat: 16.75, lng: -93.11, timestamp: Date.now() }
    };

    const res = await request(app)
      .post('/api/delivery/driver-offline')
      .set('Authorization', 'Bearer driver-token')
      .send({});

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.conductores_activos.driver_ok).toBeUndefined();
    expect(state.repartidores.driver_ok.estado_gps).toBe('offline');
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
});
