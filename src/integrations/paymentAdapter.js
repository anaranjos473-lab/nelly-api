import { validatePayment } from '../domain/contracts/payment.js';
import { normalizeState } from '../domain/stateMachine.js';

function normalizePayment(payment = {}) {
  const monto = Number(payment.monto ?? 0);

  return {
    ...payment,
    estado: normalizeState(payment.estado),
    monto
  };
}

function buildPaymentProjection(payments = []) {
  const normalizedPayments = payments.map(normalizePayment);
  const validation = normalizedPayments.map((payment) => ({
    id: payment.id,
    validation: validatePayment(payment)
  }));
  const ok = validation.every((entry) => entry.validation.ok);

  const summary = normalizedPayments.reduce((acc, payment) => {
    acc.total += payment.monto;
    acc.byEstado[payment.estado] = (acc.byEstado[payment.estado] || 0) + 1;
    return acc;
  }, { total: 0, byEstado: {} });

  return {
    ok,
    summary,
    payments: normalizedPayments,
    validation
  };
}

export {
  normalizePayment,
  buildPaymentProjection
};
