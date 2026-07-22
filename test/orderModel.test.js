import { buildCanonicalOrder } from '../src/domain/index.js';

describe('Order model', () => {
  test('construye un pedido canónico compatible con el modelo actual', () => {
    const canonical = buildCanonicalOrder({
      userId: 'user-1',
      items: [{ id: 'item-1', nombre: 'Taco', cantidad: 2, precio_unitario: 15 }],
      total: 30,
      estado: 'Pendiente'
    });

    expect(canonical.validation.ok).toBe(true);
    expect(canonical.order.estado).toBe('PENDIENTE');
    expect(canonical.order.cliente.uid).toBe('user-1');
    expect(canonical.order.lineas).toHaveLength(1);
    expect(canonical.order.total).toBe(30);
  });
});
