import { buildAdminOrderPayload } from '../src/services/adminSyncService.js';

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
});
