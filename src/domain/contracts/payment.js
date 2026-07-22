import { PAYMENT_STATES } from '../enums.js';
import { buildContract, validateRequiredFields } from './helpers.js';

const PAYMENT_CONTRACT = buildContract(
  'Payment',
  '1.0.0',
  'payment',
  ['id', 'pedido_id', 'metodo', 'estado', 'monto'],
  ['metadata', 'referencia_externa'],
  [],
  Object.values(PAYMENT_STATES)
);

function validatePayment(payment = {}) {
  const result = validateRequiredFields(PAYMENT_CONTRACT, payment);
  return result.ok ? { ok: true, contract: PAYMENT_CONTRACT } : { ok: false, contract: PAYMENT_CONTRACT, missing: result.missing };
}

export { PAYMENT_CONTRACT, validatePayment };
