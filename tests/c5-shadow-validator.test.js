import { jest } from '@jest/globals';
import { validateOrderV2, buildShadowMetrics } from '../src/services/c5ShadowValidator.js';
import { startC5ShadowObserver } from '../src/services/c5ShadowObserver.js';

function validOrder(overrides = {}) {
  const timestamp = 1783970000000;
  const base = {
    id: 'pedido_v2_1',
    short_id: 'NLY-000001',
    producer: 'admin_dashboard',
    contract_version: 2,
    fecha_creacion: timestamp,
    cliente: {
      nombre: 'Cliente',
      telefono: '9610000000',
      direccion: 'Dirección cliente',
      referencias: 'Portón azul',
      ubicacion: { lat: 16.75, lng: -93.11 }
    },
    tienda: {
      id: 'tienda_1',
      nombre: 'Tienda',
      direccion: 'Dirección tienda',
      ubicacion: { lat: 16.76, lng: -93.12 }
    },
    items: [{ nombre: 'Producto', cantidad: 1, precio_unitario_centavos: 12900, extras: [] }],
    pago: {
      moneda: 'MXN',
      subtotal_centavos: 12900,
      envio_centavos: 2000,
      propina_centavos: 0,
      total_centavos: 14900,
      metodo: 'EFECTIVO',
      estado: 'PENDIENTE'
    },
    estado: 'PENDIENTE',
    logistica: { fase_operativa: null, repartidor_uid: null, asignacion_activa: false },
    evidencia: { tipo: null, url: null, fallback: false, mime: null, timestamp: null },
    historial: {
      evt_creado: {
        id: 'evt_creado',
        tipo: 'PEDIDO_CREADO',
        idempotency_key: 'create-pedido-v2-1',
        ocurrido_en: timestamp,
        registrado_en: timestamp,
        actor: { tipo: 'SISTEMA', uid: 'backend' },
        estado_anterior: null,
        estado_nuevo: 'PENDIENTE',
        fase_anterior: null,
        fase_nueva: null,
        ubicacion: null,
        motivo_codigo: null,
        metadata: {}
      }
    }
  };
  return { ...base, ...overrides };
}

describe('C5 Shadow Validator', () => {
  it('acepta un pedido V2 completo sin modificarlo', () => {
    const order = validOrder();
    const before = structuredClone(order);
    const result = validateOrderV2(order, { key: order.id });

    expect(result).toMatchObject({ valid: true, isV2: true, errors: [], aliasesUsed: [] });
    expect(order).toEqual(before);
  });

  it('reporta campos faltantes y aliases V1 sin rechazarlos por excepción', () => {
    const order = {
      id: 'legacy_1',
      estado: 'pendiente',
      cliente_nombre: 'Cliente V1',
      monto_total: 129,
      conductorId: null
    };
    const result = validateOrderV2(order, { key: 'legacy_1' });

    expect(result.valid).toBe(false);
    expect(result.isV2).toBe(false);
    expect(result.aliasesUsed.map(({ alias }) => alias)).toEqual(expect.arrayContaining(['cliente_nombre', 'monto_total', 'conductorId']));
    expect(result.errors.map(({ code }) => code)).toContain('VERSION_INVALIDA');
  });

  it('detecta transición comercial inválida', () => {
    const result = validateOrderV2(validOrder({ estado: 'ENTREGADO' }), {
      key: 'pedido_v2_1',
      previousState: 'PENDIENTE'
    });

    expect(result.errors).toEqual(expect.arrayContaining([
      expect.objectContaining({ code: 'TRANSICION_INVALIDA', path: 'estado' })
    ]));
  });

  it('acepta una progresión válida hasta EN_CURSO con fase ASIGNADO', () => {
    const order = validOrder();
    const created = order.historial.evt_creado;
    const event = (id, tipo, ocurridoEn, estadoAnterior, estadoNuevo, faseAnterior, faseNueva) => ({
      id,
      tipo,
      idempotency_key: `key-${id}`,
      ocurrido_en: ocurridoEn,
      registrado_en: ocurridoEn,
      actor: { tipo: 'SISTEMA', uid: 'backend' },
      estado_anterior: estadoAnterior,
      estado_nuevo: estadoNuevo,
      fase_anterior: faseAnterior,
      fase_nueva: faseNueva,
      ubicacion: null,
      motivo_codigo: null,
      metadata: {}
    });
    order.estado = 'EN_CURSO';
    order.logistica = { fase_operativa: 'ASIGNADO', repartidor_uid: 'driver_1', asignacion_activa: true };
    order.historial = {
      evt_creado: created,
      evt_cocina: event('evt_cocina', 'COCINA_ACEPTO', created.ocurrido_en + 1, 'PENDIENTE', 'COCINA', null, null),
      evt_listo: event('evt_listo', 'PEDIDO_LISTO', created.ocurrido_en + 2, 'COCINA', 'LISTO', null, null),
      evt_acepto: event('evt_acepto', 'REPARTIDOR_ACEPTO', created.ocurrido_en + 3, 'LISTO', 'EN_CURSO', null, 'ASIGNADO')
    };

    expect(validateOrderV2(order, { key: order.id })).toMatchObject({ valid: true, isV2: true });
  });

  it('detecta coordenadas e importes inconsistentes', () => {
    const order = validOrder({
      cliente: { ...validOrder().cliente, ubicacion: { lat: 0, lng: 0 } },
      pago: { ...validOrder().pago, total_centavos: 1 }
    });
    const result = validateOrderV2(order, { key: order.id });

    expect(result.errors.map(({ code }) => code)).toEqual(expect.arrayContaining(['COORDENADAS_INVALIDAS', 'TOTAL_INCONSISTENTE']));
  });

  it('genera métricas agregadas sin datos del cliente', () => {
    const valid = validateOrderV2(validOrder(), { key: 'pedido_v2_1' });
    const legacy = validateOrderV2({ id: 'legacy', estado: 'LISTO', total: 100 }, { key: 'legacy' });
    const metrics = buildShadowMetrics(new Map([
      ['pedido_v2_1', { result: valid, producer: 'admin_dashboard' }],
      ['legacy', { result: legacy, producer: 'NO_DECLARADO' }]
    ]), { validationRuns: 2, generatedAt: 123 });

    expect(metrics).toMatchObject({
      generated_at: 123,
      total_orders: 2,
      v2_orders: 1,
      valid_v2_orders: 1,
      invalid_orders: 1,
      validation_runs: 2,
      v2_percentage: 50,
      valid_v2_percentage: 50
    });
    expect(metrics).not.toHaveProperty('cliente');
  });
});

describe('C5 Shadow Observer', () => {
  it('apagado no consulta RTDB', async () => {
    const db = { ref: jest.fn() };
    const observer = await startC5ShadowObserver({ db, enabled: false });
    expect(observer.enabled).toBe(false);
    expect(db.ref).not.toHaveBeenCalled();
  });

  it('solo usa lecturas/listeners y puede detenerse', async () => {
    const handlers = {};
    const ref = {
      once: jest.fn(async () => ({ val: () => ({ pedido_v2_1: validOrder() }) })),
      on: jest.fn((event, handler) => { handlers[event] = handler; }),
      off: jest.fn(),
      set: jest.fn(),
      update: jest.fn(),
      remove: jest.fn()
    };
    const logger = { info: jest.fn(), warn: jest.fn(), error: jest.fn() };
    const observer = await startC5ShadowObserver({
      db: { ref: jest.fn(() => ref) },
      enabled: true,
      logger,
      now: () => 123
    });

    expect(observer.enabled).toBe(true);
    expect(observer.getMetrics()).toMatchObject({ total_orders: 1, valid_v2_orders: 1 });
    expect(ref.on).toHaveBeenCalledTimes(3);
    expect(ref.set).not.toHaveBeenCalled();
    expect(ref.update).not.toHaveBeenCalled();
    expect(ref.remove).not.toHaveBeenCalled();

    const logsIniciales = logger.info.mock.calls.length;
    handlers.child_changed({ key: 'pedido_v2_1', val: () => validOrder() });
    expect(logger.info).toHaveBeenCalledTimes(logsIniciales);

    handlers.child_changed({ key: 'pedido_v2_1', val: () => validOrder({ estado: 'ENTREGADO' }) });
    expect(observer.getMetrics().invalid_transition_events).toBeGreaterThan(0);

    observer.stop();
    expect(ref.off).toHaveBeenCalledTimes(3);
  });
});
