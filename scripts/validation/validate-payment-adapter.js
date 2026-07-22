import { buildPaymentProjection } from '../../src/integrations/index.js';

const projection = buildPaymentProjection([
  { id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'confirmado', monto: 125 },
  { id: 'PAY-2', pedido_id: 'ORD-2', metodo: 'card', estado: 'pendiente', monto: 75 }
]);

let ok = true;

if (!projection.ok) {
  console.error('La proyeccion de pagos no es valida');
  ok = false;
}

if (projection.summary.total !== 200) {
  console.error('El total de pagos no coincide');
  ok = false;
}

if (projection.summary.byEstado.CONFIRMADO !== 1 || projection.summary.byEstado.PENDIENTE !== 1) {
  console.error('El resumen por estado de pagos no coincide');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-payment-adapter: OK');
