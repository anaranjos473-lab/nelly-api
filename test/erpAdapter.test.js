import { buildErpProjection, normalizeErpProduct } from '../src/integrations/index.js';

describe('erpAdapter', () => {
  test('normaliza un producto ERP', () => {
    const product = normalizeErpProduct({ id: 'ERP-1', sku: 'SKU-1', stock: '7', reorder_point: '2' });
    expect(product.stock).toBe(7);
    expect(product.reorder_point).toBe(2);
  });

  test('construye una proyeccion ERP valida', () => {
    const projection = buildErpProjection({
      products: [{ id: 'ERP-1', sku: 'SKU-1', stock: 7, reorder_point: 2 }],
      orders: [{ id: 'ORD-1', cliente_id: 'C-1', lineas: [{ sku: 'SKU-1', cantidad: 1 }], estado: 'CREADO', created_at: 1, updated_at: 1 }]
    });
    expect(projection.ok).toBe(true);
    expect(projection.products).toHaveLength(1);
    expect(projection.orders).toHaveLength(1);
  });
});
