import { buildInventoryProjection, normalizeInventoryItem } from '../src/integrations/index.js';

describe('inventoryAdapter', () => {
  test('normaliza un item de inventario', () => {
    const item = normalizeInventoryItem({
      id: 'INV-1',
      sku: 'SKU-1',
      nodo_id: 'NODE-1',
      disponible: '4',
      reservado: '1',
      total: '5'
    });

    expect(item.disponible).toBe(4);
    expect(item.reservado).toBe(1);
    expect(item.total).toBe(5);
  });

  test('construye una proyeccion de inventario valida', () => {
    const projection = buildInventoryProjection([
      { id: 'INV-1', sku: 'SKU-1', nodo_id: 'NODE-1', disponible: 4, reservado: 1, total: 5 },
      { id: 'INV-2', sku: 'SKU-2', nodo_id: 'NODE-2', disponible: 6, reservado: 0, total: 6 }
    ]);

    expect(projection.ok).toBe(true);
    expect(projection.summary).toEqual({ total: 11, disponible: 10, reservado: 1 });
    expect(projection.validation).toHaveLength(2);
  });
});
