import { buildAdminOrderPayload, normalizeAdminOrderRequest } from '../src/services/adminSyncService.js';

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
    expect(payload.estado_pedido).toBe('CREADO');
    expect(payload.cliente).toMatchObject({ uid: 'Cliente', id: 'Cliente' });
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
});
