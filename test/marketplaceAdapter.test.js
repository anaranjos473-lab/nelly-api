import { buildMarketplaceProjection, normalizeMarketplaceListing } from '../src/integrations/index.js';

describe('marketplaceAdapter', () => {
  test('normaliza una publicacion de marketplace', () => {
    const listing = normalizeMarketplaceListing({ id: 'MK-1', seller_id: 'S-1', sku: 'SKU-1', price: '123', active: true });
    expect(listing.price).toBe(123);
    expect(listing.active).toBe(true);
  });

  test('construye una proyeccion marketplace valida', () => {
    const projection = buildMarketplaceProjection({
      listings: [{ id: 'MK-1', seller_id: 'S-1', sku: 'SKU-1', price: 123, active: true }],
      orders: [{ id: 'ORD-1', cliente_id: 'C-1', lineas: [{ sku: 'SKU-1', cantidad: 1 }], estado: 'CREADO', created_at: 1, updated_at: 1 }]
    });
    expect(projection.ok).toBe(true);
    expect(projection.listings).toHaveLength(1);
    expect(projection.orders).toHaveLength(1);
  });
});
