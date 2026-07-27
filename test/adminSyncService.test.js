import {
  buildAdminOrderPayload,
  buildAdminOrdersMetrics,
  buildPersistedAdminOrderRecord,
  normalizeAdminOrderRequest,
  validateAdminOrderRequest
} from '../src/services/adminSyncService.js';

describe('adminSyncService', () => {
  test('buildAdminOrderPayload normalizes panel order fields', () => {
    const payload = buildAdminOrderPayload({
      pedidoId: 'P1',
      timestamp: 1000,
      cliente_nombre: '  Cliente  ',
      telefono: '  123  ',
      direccion: '  Dir  ',
      descripcion: '  Desc  ',
      tipo_ubicacion: '',
      metodo_entrega: '',
      referencia_ubicacion: '  Ref  ',
      notas_ubicacion: '  Nota  ',
      coordenadas: { clienteLat: 1, clienteLng: 2, tiendaLat: 3, tiendaLng: 4 },
      normalizedItems: [{ nombre: 'A', cantidad: 1 }],
      subtotal: 10.123,
      costo_envio: 2.345,
      propina: 1.2,
      total: 13.668,
      pago: { metodo: ' efectivo ', estado: ' pendiente ' }
    });

    expect(payload.id).toBe('P1');
    expect(payload.shortId).toBeNull();
    expect(payload.cliente_nombre).toBe('Cliente');
    expect(payload.tipo_ubicacion).toBe('otro');
    expect(payload.metodo_entrega).toBe('puerta');
    expect(payload.subtotal).toBe(10.12);
    expect(payload.costo_envio).toBe(2.35);
    expect(payload.total).toBe(13.67);
    expect(payload.lineas).toHaveLength(1);
    expect(payload.pago.metodo).toBe('efectivo');
    expect(payload.estado_pedido).toBe('PENDIENTE');
    expect(payload.cliente).toBe('Cliente');
  });

  test('normalizeAdminOrderRequest trims and coerces admin input', () => {
    const normalized = normalizeAdminOrderRequest({
      cliente_nombre: '  Cliente  ',
      telefono: '  555  ',
      direccion: '  Calle 1  ',
      descripcion: '  Nota  ',
      tipo_ubicacion: '  ',
      metodo_entrega: '  ',
      referencia_ubicacion: '  Ref  ',
      notas_ubicacion: '  Obs  ',
      coordenadas: {
        clienteLat: '19.1',
        clienteLng: '-99.1',
        tiendaLat: '19.2',
        tiendaLng: '-99.2'
      },
      normalizedItems: [{ nombre: 'A', cantidad: 1 }],
      subtotal: '10.12',
      costo_envio: '2.34',
      propina: '1.00',
      total: '13.46',
      pago: { metodo: '  efectivo  ', estado: '  pendiente  ' }
    });

    expect(normalized.cliente_nombre).toBe('Cliente');
    expect(normalized.tipo_ubicacion).toBe('otro');
    expect(normalized.metodo_entrega).toBe('puerta');
    expect(normalized.coordenadas.clienteLat).toBe(19.1);
    expect(normalized.coordenadas.tiendaLng).toBe(-99.2);
    expect(normalized.subtotal).toBe(10.12);
    expect(normalized.total).toBe(13.46);
    expect(normalized.pago.metodo).toBe('efectivo');
    expect(normalized.pago.estado).toBe('pendiente');
  });

  test('buildPersistedAdminOrderRecord keeps canonical payload and shortId together', () => {
    const record = buildPersistedAdminOrderRecord({
      pedidoId: 'P2',
      timestamp: 2000,
      shortId: '0101-99',
      normalizedRequest: normalizeAdminOrderRequest({
        cliente_nombre: 'Cliente',
        telefono: '555',
        direccion: 'Calle 1',
        descripcion: '',
        tipo_ubicacion: '',
        metodo_entrega: '',
        referencia_ubicacion: '',
        notas_ubicacion: '',
        coordenadas: { clienteLat: 19, clienteLng: -99, tiendaLat: 19.1, tiendaLng: -99.1 },
        normalizedItems: [{ nombre: 'A', cantidad: 1, precio: 10 }],
        subtotal: 10,
        costo_envio: 0,
        propina: 0,
        total: 10,
        pago: { metodo: 'efectivo', estado: 'pendiente' }
      })
    });

    expect(record.id).toBe('P2');
    expect(record.shortId).toBe('0101-99');
    expect(record.estado_pedido).toBe('PENDIENTE');
    expect(record.lineas).toHaveLength(1);
    expect(record.pago.metodo).toBe('efectivo');
  });

  test('buildAdminOrdersMetrics aggregates operational counts', () => {
    const metrics = buildAdminOrdersMetrics({
      now: new Date('2026-07-22T12:00:00-06:00').getTime(),
      pedidos: {
        A: {
          createdAt: new Date('2026-07-22T08:00:00-06:00').getTime(),
          aceptado_en: new Date('2026-07-22T08:10:00-06:00').getTime(),
          entregado_en: new Date('2026-07-22T08:30:00-06:00').getTime(),
          estado: 'ENTREGADO'
        },
        B: {
          created_at: new Date('2026-07-22T09:00:00-06:00').getTime(),
          tomado_en: new Date('2026-07-22T09:15:00-06:00').getTime(),
          estado_pedido: 'CANCELADO'
        }
      },
      pedidosActivos: { A: true },
      conductores: { D1: true, D2: true }
    });

    expect(metrics.ok).toBe(true);
    expect(metrics.activos).toBe(1);
    expect(metrics.pedidosCreadosHoy).toBe(2);
    expect(metrics.pedidosEntregadosHoy).toBe(1);
    expect(metrics.pedidosCanceladosHoy).toBe(1);
    expect(metrics.conductoresActivos).toBe(2);
    expect(metrics.avgAsignacionMinutos).toBe(12.5);
    expect(metrics.avgEntregaMinutos).toBe(20);
  });

  test('buildAdminOrdersMetrics ignores operational time outliers', () => {
    const metrics = buildAdminOrdersMetrics({
      now: new Date('2026-07-22T12:00:00-06:00').getTime(),
      pedidos: {
        A: {
          createdAt: new Date('2026-07-22T08:00:00-06:00').getTime(),
          aceptado_en: new Date('2026-07-22T08:10:00-06:00').getTime(),
          entregado_en: new Date('2026-07-22T08:30:00-06:00').getTime(),
          estado: 'ENTREGADO'
        },
        B: {
          createdAt: new Date('2026-07-22T08:00:00-06:00').getTime(),
          aceptado_en: new Date('2026-07-22T08:05:00-06:00').getTime(),
          entregado_en: new Date('2026-07-23T08:05:00-06:00').getTime(),
          estado: 'ENTREGADO'
        }
      }
    });

    expect(metrics.avgAsignacionMinutos).toBe(7.5);
    expect(metrics.avgEntregaMinutos).toBe(20);
  });

  test('validateAdminOrderRequest centralizes request checks', () => {
    const ok = validateAdminOrderRequest({
      cliente_nombre: 'Cliente',
      telefono: '555',
      direccion: 'Calle 1',
      coordenadas: { clienteLat: 19, clienteLng: -99, tiendaLat: 19.1, tiendaLng: -99.1 },
      normalizedItems: [{ nombre: 'A', cantidad: 1, precio: 10 }],
      subtotal: 10,
      costo_envio: 0,
      propina: 0,
      total: 10,
      pago: { metodo: 'efectivo', estado: 'pendiente' }
    });

    expect(ok.ok).toBe(true);
    expect(ok.errors).toHaveLength(0);

    const rejected = validateAdminOrderRequest({
      cliente_nombre: '',
      telefono: '',
      direccion: '',
      coordenadas: { clienteLat: 0, clienteLng: 0, tiendaLat: 0, tiendaLng: 0 },
      normalizedItems: [],
      subtotal: 0,
      costo_envio: -1,
      propina: -1,
      total: 0,
      pago: {}
    });

    expect(rejected.ok).toBe(false);
    expect(rejected.errors.length).toBeGreaterThan(0);
  });
});
