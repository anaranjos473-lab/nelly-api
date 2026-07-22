import { buildPosProjection } from '../../src/integrations/index.js';

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

let ok = true;

if (!projection.ok) {
  console.error('La proyeccion POS no es valida');
  ok = false;
}

if (projection.summary.total !== 150) {
  console.error('El total POS no coincide');
  ok = false;
}

if (projection.summary.byEstado.LISTO !== 1 || projection.summary.byEstado.CREADO !== 1) {
  console.error('El resumen POS por estado no coincide');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-pos-adapter: OK');
