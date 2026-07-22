import { buildBillingProjection } from '../../src/integrations/index.js';

const projection = buildBillingProjection([
  { id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'confirmado', monto: 125 },
  { id: 'PAY-2', pedido_id: 'ORD-2', metodo: 'card', estado: 'pendiente', monto: 75 }
], { invoiceId: 'INV-1', currency: 'MXN' });

let ok = true;

if (!projection.ok) {
  console.error('La proyeccion de facturacion no es valida');
  ok = false;
}

if (projection.invoice.total_amount !== 200 || projection.invoice.payment_count !== 2) {
  console.error('La factura no coincide con el resumen esperado');
  ok = false;
}

if (projection.invoice.status !== 'READY') {
  console.error('La factura no quedo lista');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-billing-adapter: OK');
