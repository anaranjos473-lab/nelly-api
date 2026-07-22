import { buildInventoryProjection } from '../../src/integrations/index.js';

const projection = buildInventoryProjection([
  { id: 'INV-1', sku: 'SKU-1', nodo_id: 'NODE-1', disponible: 4, reservado: 1, total: 5 },
  { id: 'INV-2', sku: 'SKU-2', nodo_id: 'NODE-2', disponible: 6, reservado: 0, total: 6 }
]);

let ok = true;

if (!projection.ok) {
  console.error('La proyeccion de inventario no es valida');
  ok = false;
}

if (projection.summary.total !== 11 || projection.summary.disponible !== 10 || projection.summary.reservado !== 1) {
  console.error('El resumen de inventario no coincide');
  ok = false;
}

if (projection.validation.length !== 2) {
  console.error('La validacion por item no tiene el tamaño esperado');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-inventory-adapter: OK');
