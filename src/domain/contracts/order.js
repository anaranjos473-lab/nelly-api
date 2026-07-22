import { ORDER_STATES } from '../enums.js';
import { buildContract, validateRequiredFields } from './helpers.js';

const ORDER_CONTRACT = buildContract(
  'Order',
  '1.0.0',
  'pedido',
  ['id', 'cliente', 'lineas', 'estado', 'created_at', 'updated_at'],
  ['metadata', 'fulfillment', 'payment', 'evidence'],
  ['total', 'subtotal', 'impuestos', 'descuentos'],
  Object.values(ORDER_STATES)
);

function validateOrder(order = {}) {
  const basic = validateRequiredFields(ORDER_CONTRACT, order);
  if (!basic.ok) {
    return { ok: false, contract: ORDER_CONTRACT, missing: basic.missing };
  }

  if (!Array.isArray(order.lineas)) {
    return { ok: false, contract: ORDER_CONTRACT, missing: ['lineas'] };
  }

  return { ok: true, contract: ORDER_CONTRACT };
}

export { ORDER_CONTRACT, validateOrder };
