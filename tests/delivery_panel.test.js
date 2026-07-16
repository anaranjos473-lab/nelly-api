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
  pedidos: {
    pedido_ok: { id_pedido: 'pedido_ok', estado: 'LISTO', monto_total: 120 },
    pedido_transition: {
      id_pedido: 'pedido_transition',
      estado: 'EN_CURSO',
      estado_pedido: 'EN_CURSO',
      monto_total: 120,
      repartidor_id: 'driver_ok',
      conductorId: 'driver_ok'
    },
    pedido_dispatch: { id_pedido: 'pedido_dispatch', estado: 'pendiente', monto_total: 150 },
    pedido_invalido: { id_pedido: 'pedido_invalido', estado: 'PENDIENTE', monto_total: 90 }
  },
  pedidos_para_reparto: {
    pedido_ok: { id_pedido: 'pedido_ok', estado: 'LISTO', monto_total: 120 },
    pedido_invalido: { id_pedido: 'pedido_invalido', estado: 'PENDIENTE', monto_total: 90 }
  },
  pedidos_en_camino: {}
};

state.pedidos_en_camino.pedido_transition = { ...state.pedidos.pedido_transition };

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
      createCustomToken: jest.fn(async (uid, claims) => `custom-token:${uid}:${JSON.stringify(claims)}`),
      verifyIdToken: jest.fn(async (token) => {
        if (token === 'panel-token') {
          return { uid: 'admin_panel', admin: true, email: 'admin@nellydelivery.com' };
        }
        if (token === 'panel-claim-token') {
          return { uid: 'panel_only', panel: true, email: 'panel@nellydelivery.com' };
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
  it('despacha desde cocina publicando el pedido para reparto', async () => {
    const res = await request(app)
      .post('/api/delivery/dispatch-order')
      .set('Authorization', 'Bearer panel-token')
      .send({
        pedidoId: 'pedido_dispatch',
        pedido: { cliente_nombre: 'Cliente Dispatch', monto_total: 150 }
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos.pedido_dispatch.estado).toBe('LISTO');
    expect(state.pedidos.pedido_dispatch.cliente_nombre).toBe('Cliente Dispatch');
    expect(state.pedidos_para_reparto.pedido_dispatch.estado).toBe('LISTO');
    expect(state.pedidos_en_camino.pedido_dispatch).toBeUndefined();
  });

  it('entrega custom token Firebase para el panel', async () => {
    const res = await request(app)
      .get('/api/auth/panel-token?uid=panel-test');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toContain('custom-token:panel-test:');
    expect(res.body.token).toContain('"panel":true');
    expect(res.body.token).toContain('"role":"panel_cocina"');
  });

  it('entrega custom token Firebase para el repartidor', async () => {
    const res = await request(app)
      .get('/api/auth/driver-token?uid=driver_ok');

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.token).toContain('custom-token:driver_ok:');
    expect(res.body.token).toContain('"driver":true');
    expect(res.body.token).toContain('"role":"repartidor"');
  });

  it('rechaza despacho de cocina sin token', async () => {
    const res = await request(app)
      .post('/api/delivery/dispatch-order')
      .send({ pedidoId: 'pedido_dispatch' });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe('Token requerido');
  });

  it('acepta un pedido disponible para un repartidor sin bloqueo', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos_en_camino.pedido_ok.estado).toBe('EN_CURSO');
    expect(state.pedidos.pedido_ok.estado).toBe('EN_CURSO');
    expect(state.pedidos.pedido_ok.estado_pedido).toBe('EN_CURSO');
    expect(state.pedidos.pedido_ok.repartidor_id).toBe('driver_ok');
  });

  it('transiciona llegada a tienda y sincroniza el indice derivado', async () => {
    state.repartidores.driver_ok.pedido_activo = 'pedido_transition';
    const res = await request(app)
      .post('/api/delivery/transition-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_transition', estado: 'LLEGUE_A_TIENDA' });

    expect(res.statusCode).toBe(200);
    expect(res.body.estado).toBe('LLEGUE_A_TIENDA');
    expect(state.pedidos.pedido_transition.estado).toBe('LLEGUE_A_TIENDA');
    expect(state.pedidos_en_camino.pedido_transition.estado).toBe('LLEGUE_A_TIENDA');
  });

  it('rechaza saltar de llegada a tienda hasta llegada al cliente', async () => {
    const res = await request(app)
      .post('/api/delivery/transition-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_transition', estado: 'LLEGUE_A_CLIENTE' });

    expect(res.statusCode).toBe(409);
    expect(res.body.estadoActual).toBe('LLEGUE_A_TIENDA');
    expect(state.pedidos.pedido_transition.estado).toBe('LLEGUE_A_TIENDA');
  });

  it('reconcilia de forma idempotente el indice de una transicion ya aplicada', async () => {
    state.pedidos_en_camino.pedido_transition.estado = 'EN_CURSO';
    const res = await request(app)
      .post('/api/delivery/transition-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_transition', estado: 'LLEGUE_A_TIENDA' });

    expect(res.statusCode).toBe(200);
    expect(res.body.idempotent).toBe(true);
    expect(state.pedidos_en_camino.pedido_transition.estado).toBe('LLEGUE_A_TIENDA');
  });

  it('rechaza aceptar pedido si no esta listo para reparto', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_invalido' });

    expect(res.statusCode).toBe(409);
    expect(String(res.body.error).toLowerCase()).toContain('no esta listo');
    expect(state.pedidos_en_camino.pedido_invalido).toBeUndefined();
    expect(state.pedidos.pedido_invalido.estado).toBe('PENDIENTE');
  });

  it('rechaza aceptar pedido si el repartidor esta bloqueado por deuda', async () => {
    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer blocked-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(403);
    expect(String(res.body.error).toLowerCase()).toContain('deuda');
  });

  it('acepta un pedido con token de respaldo de desarrollo cuando estÃ¡ habilitado', async () => {
    process.env.NODE_ENV = 'development';
    process.env.DEV_AUTH_TOKEN = 'dev-local-token';
    process.env.DEV_AUTH_UID = 'dev-driver';
    state.repartidores['dev-driver'] = {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 100, limite_deuda: 300, saldo_ganancias: 0 }
    };
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'LISTO',
      estado_pedido: 'LISTO',
      monto_total: 120,
      repartidor_id: null
    };

    const res = await request(app)
      .post('/api/delivery/accept-order')
      .set('Authorization', 'Bearer dev-local-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
  });

  it('actualiza ubicacion del repartidor autenticado', async () => {
    const res = await request(app)
      .post('/api/delivery/update-location')
      .set('Authorization', 'Bearer driver-token')
      .send({ lat: 16.75, lng: -93.11, pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(state.repartidores.driver_ok.ubicacion.lat).toBe(16.75);
    expect(state.conductores_activos.driver_ok.lng).toBe(-93.11);
    expect(state.pedidos.pedido_ok.ubicacion_repartidor.lat).toBe(16.75);
  });

  it('persiste un subestado de reparto cuando el payload lo incluye', async () => {
    const res = await request(app)
      .post('/api/delivery/update-location')
      .set('Authorization', 'Bearer driver-token')
      .send({
        lat: 16.76,
        lng: -93.12,
        pedidoId: 'pedido_ok',
        estado: 'PEDIDO_ABORDO',
        estado_pedido: 'PEDIDO_ABORDO',
        fase_panel: 'En reparto'
      });

    expect(res.statusCode).toBe(200);
    expect(state.pedidos.pedido_ok.estado).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.estado_pedido).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.logistica.estado).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.fase_panel).toBe('En reparto');
  });

  it('mantiene el subestado persistido tras un breve intervalo', async () => {
    const res = await request(app)
      .post('/api/delivery/update-location')
      .set('Authorization', 'Bearer driver-token')
      .send({
        lat: 16.77,
        lng: -93.13,
        pedidoId: 'pedido_ok',
        estado: 'PEDIDO_ABORDO',
        estado_pedido: 'PEDIDO_ABORDO',
        fase_panel: 'En reparto'
      });

    expect(res.statusCode).toBe(200);

    await new Promise((resolve) => setTimeout(resolve, 50));

    expect(state.pedidos.pedido_ok.estado).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.estado_pedido).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.logistica.estado).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.fase_panel).toBe('En reparto');
  });

  it('no revierte un subestado avanzado cuando llega un estado anterior', async () => {
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'PEDIDO_ABORDO',
      estado_pedido: 'PEDIDO_ABORDO',
      logistica: { estado: 'PEDIDO_ABORDO' },
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/update-location')
      .set('Authorization', 'Bearer driver-token')
      .send({
        lat: 16.78,
        lng: -93.14,
        pedidoId: 'pedido_ok',
        estado: 'EN_CURSO',
        estado_pedido: 'EN_CURSO',
        fase_panel: 'En reparto'
      });

    expect(res.statusCode).toBe(200);
    expect(state.pedidos.pedido_ok.estado).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.estado_pedido).toBe('PEDIDO_ABORDO');
    expect(state.pedidos.pedido_ok.logistica.estado).toBe('PEDIDO_ABORDO');
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
    state.pedidos.pedido_otro = {
      id_pedido: 'pedido_otro',
      estado: 'EN_CURSO',
      monto_total: 120,
      repartidor_id: 'driver_blocked'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_otro' });

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toContain('Solo el repartidor asignado');
  });

  it('completa un pedido desde el repartidor asignado y registra finanzas', async () => {
    state.repartidores.driver_ok.pedido_activo = 'pedido_ok';
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'EN_CURSO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.comision).toBe(21.6);
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
    expect(state.repartidores.driver_ok.pedido_activo).toBeNull();
    expect(state.repartidores.driver_ok.finanzas.ultimo_cobro_efectivo.monto).toBe(21.6);
  });

  it('reconcilia complete-order idempotente y limpia indices residuales', async () => {
    state.repartidores.driver_ok.pedido_activo = 'pedido_ok';
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'ENTREGADO',
      estado_pedido: 'ENTREGADO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };
    state.pedidos_en_camino.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'LLEGUE_A_CLIENTE',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok', comision: 20 });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(res.body.alreadyCompleted).toBe(true);
    expect(res.body.finanzas).toBeNull();
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
    expect(state.pedidos_en_camino.pedido_ok).toBeNull();
    expect(state.repartidores.driver_ok.pedido_activo).toBeNull();
  });

  it('completa y crea finanzas si el perfil del repartidor no existe', async () => {
    delete state.repartidores.driver_ok;
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'EN_CURSO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
    expect(state.repartidores.driver_ok.uid).toBe('driver_ok');
    expect(state.repartidores.driver_ok.finanzas.ultimo_cobro_efectivo.monto).toBe(21.6);
  });

  it('no duplica finanzas si complete-order se reintenta sobre pedido entregado', async () => {
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'ENTREGADO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };
    const deudaAntes = state.repartidores.driver_ok.finanzas.deuda_actual;

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.alreadyCompleted).toBe(true);
    expect(state.repartidores.driver_ok.finanzas.deuda_actual).toBe(deudaAntes);
  });

  it('completa un pedido cuando admin tiene token valido', async () => {
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'EN_CURSO',
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
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
  });

  it('completa un pedido cuando el token tiene claim panel', async () => {
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'EN_CURSO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer panel-claim-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
  });

  it('completa un pedido desde subestado PEDIDO_ABORDO', async () => {
    state.repartidores.driver_ok = {
      estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
      finanzas: { deuda_actual: 100, limite_deuda: 300, saldo_ganancias: 0 },
      pedido_activo: 'pedido_ok'
    };
    state.pedidos.pedido_ok = {
      id_pedido: 'pedido_ok',
      estado: 'PEDIDO_ABORDO',
      monto_total: 120,
      repartidor_id: 'driver_ok'
    };

    const res = await request(app)
      .post('/api/delivery/complete-order')
      .set('Authorization', 'Bearer driver-token')
      .send({ pedidoId: 'pedido_ok' });

    expect(res.statusCode).toBe(200);
    expect(res.body.ok).toBe(true);
    expect(state.pedidos.pedido_ok.estado).toBe('ENTREGADO');
  });
});

