import { buildPaymentProjection } from './paymentAdapter.js';

function buildBillingProjection(payments = [], { invoiceId = `INV-${Date.now()}`, currency = 'MXN' } = {}) {
  const paymentProjection = buildPaymentProjection(payments);
  const invoice = {
    id: invoiceId,
    currency,
    payment_count: paymentProjection.payments.length,
    total_amount: paymentProjection.summary.total,
    by_estado: paymentProjection.summary.byEstado,
    status: paymentProjection.ok ? 'READY' : 'INVALID'
  };

  return {
    ok: paymentProjection.ok,
    invoice,
    payments: paymentProjection.payments,
    validation: paymentProjection.validation
  };
}

export {
  buildBillingProjection
};
