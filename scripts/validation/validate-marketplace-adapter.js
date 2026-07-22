import { buildMarketplaceProjection } from '../../src/integrations/index.js';

const projection = buildMarketplaceProjection({
  listings: [{ id: 'MK-1', seller_id: 'S-1', sku: 'SKU-1', price: 123, active: true }],
  orders: [{ id: 'ORD-1', cliente_id: 'C-1', lineas: [{ sku: 'SKU-1', cantidad: 1 }], estado: 'CREADO', created_at: 1, updated_at: 1 }]
});

let ok = true;

if (!projection.ok || projection.listings.length !== 1 || projection.orders.length !== 1) {
  console.error('La proyeccion marketplace no es valida');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-marketplace-adapter: OK');
