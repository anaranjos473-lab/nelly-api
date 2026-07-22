import { buildPosProjection, normalizePosOrder } from '../src/integrations/index.js';

describe('posAdapter', () => {
  test('normaliza una orden POS', () => {
    const order = normalizePosOrder({
      id: 'POS-1',
      cliente_id: 'C-1',
      estado: 'listo',
      subtotal: '90',
      total: '100'
    });

    expect(order.estado).toBe('LISTO');
    expect(order.subtotal).toBe(90);
    expect(order.total).toBe(100);
  });

  test('construye una proyeccion POS valida', () => {
    const projection = buildPosProjection([
      {
        id: 'POS-1',
        cliente_id: 'C-1',
        estado: 'listo',
        subtotal: 90,
        total: 100,
        lineas: [{ sku: 'A1', cantidad: 1 }],
        created_at: 1,
        updated_at: 1
      },
      {
        id: 'POS-2',
        cliente_id: 'C-2',
        estado: 'creado',
        subtotal: 50,
        total: 50,
        lineas: [{ sku: 'B1', cantidad: 1 }],
        created_at: 1,
        updated_at: 1
      }
    ]);

    expect(projection.ok).toBe(true);
    expect(projection.summary.total).toBe(150);
    expect(projection.summary.byEstado.LISTO).toBe(1);
    expect(projection.summary.byEstado.CREADO).toBe(1);
  });
});
