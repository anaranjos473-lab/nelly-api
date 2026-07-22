import { buildContract, validateRequiredFields } from './helpers.js';

const ORDER_ITEM_CONTRACT = buildContract(
  'OrderItem',
  '1.0.0',
  'pedido_linea',
  ['id', 'pedido_id', 'producto_id', 'cantidad', 'precio_unitario'],
  ['nombre', 'metadata'],
  ['subtotal']
);

function validateOrderItem(item = {}) {
  const result = validateRequiredFields(ORDER_ITEM_CONTRACT, item);
  return result.ok ? { ok: true, contract: ORDER_ITEM_CONTRACT } : { ok: false, contract: ORDER_ITEM_CONTRACT, missing: result.missing };
}

export { ORDER_ITEM_CONTRACT, validateOrderItem };
