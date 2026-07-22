import { buildErpProjection } from '../../src/integrations/index.js';

const projection = buildErpProjection({
  products: [{ id: 'ERP-1', sku: 'SKU-1', stock: 7, reorder_point: 2 }],
  orders: [{ id: 'ORD-1', cliente_id: 'C-1', lineas: [{ sku: 'SKU-1', cantidad: 1 }], estado: 'CREADO', created_at: 1, updated_at: 1 }]
});

let ok = true;

if (!projection.ok || projection.products.length !== 1 || projection.orders.length !== 1) {
  console.error('La proyeccion ERP no es valida');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-erp-adapter: OK');
