import { buildPaymentProjection, normalizePayment } from '../src/integrations/index.js';

describe('paymentAdapter', () => {
  test('normaliza un pago', () => {
    const payment = normalizePayment({
      id: 'PAY-1',
      pedido_id: 'ORD-1',
      metodo: 'cash',
      estado: 'confirmado',
      monto: '125'
    });

    expect(payment.estado).toBe('CONFIRMADO');
    expect(payment.monto).toBe(125);
  });

  test('construye una proyeccion de pagos valida', () => {
    const projection = buildPaymentProjection([
      { id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'confirmado', monto: 125 },
      { id: 'PAY-2', pedido_id: 'ORD-2', metodo: 'card', estado: 'pendiente', monto: 75 }
    ]);

    expect(projection.ok).toBe(true);
    expect(projection.summary.total).toBe(200);
    expect(projection.summary.byEstado.CONFIRMADO).toBe(1);
    expect(projection.summary.byEstado.PENDIENTE).toBe(1);
  });
});
