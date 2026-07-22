import { buildBillingProjection } from '../src/integrations/index.js';

describe('billingAdapter', () => {
  test('construye una proyeccion de facturacion valida', () => {
    const projection = buildBillingProjection([
      { id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'confirmado', monto: 125 },
      { id: 'PAY-2', pedido_id: 'ORD-2', metodo: 'card', estado: 'pendiente', monto: 75 }
    ], { invoiceId: 'INV-1', currency: 'MXN' });

    expect(projection.ok).toBe(true);
    expect(projection.invoice).toEqual({
      id: 'INV-1',
      currency: 'MXN',
      payment_count: 2,
      total_amount: 200,
      by_estado: { CONFIRMADO: 1, PENDIENTE: 1 },
      status: 'READY'
    });
  });
});
