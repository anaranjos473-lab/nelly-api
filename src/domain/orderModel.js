import { ORDER_CONTRACT, validateOrder } from './contracts/order.js';
import { normalizeState } from './stateMachine.js';

function buildOrderLine(item, index = 0) {
  if (!item || typeof item !== 'object') {
    return null;
  }

  const quantity = Number(item.cantidad ?? item.quantity ?? 1);
  const unitPrice = Number(item.precio_unitario ?? item.price ?? item.unitPrice ?? 0);

  return {
    id: item.id || item.producto_id || item.sku || `line_${index + 1}`,
    pedido_id: null,
    producto_id: item.producto_id || item.sku || item.id || `item_${index + 1}`,
    cantidad: Number.isFinite(quantity) ? quantity : 1,
    precio_unitario: Number.isFinite(unitPrice) ? unitPrice : 0,
    metadata: {
      nombre: item.nombre || item.name || null
    }
  };
}

function buildCanonicalOrder({
  id = `pedido_${Date.now()}`,
  userId,
  cliente = null,
  items = [],
  total = 0,
  estado = 'CREADO',
  createdAt = Date.now(),
  updatedAt = createdAt,
  metadata = {}
} = {}) {
  const lineas = items.map(buildOrderLine).filter(Boolean).map((linea, index) => ({
    ...linea,
    pedido_id: id || null,
    id: linea.id || `line_${index + 1}`
  }));

  const order = {
    id,
    cliente: cliente || {
      id: userId,
      uid: userId
    },
    lineas,
    estado: normalizeState(estado),
    created_at: createdAt,
    updated_at: updatedAt,
    metadata: {
      ...metadata
    },
    fulfillment: metadata.fulfillment || null,
    payment: metadata.payment || null,
    evidence: metadata.evidence || null,
    total: Number(total),
    subtotal: Number(total),
    impuestos: 0,
    descuentos: 0,
    userId,
    items,
    createdAt,
    updatedAt
  };

  return {
    contract: ORDER_CONTRACT,
    order,
    validation: validateOrder(order)
  };
}

export {
  buildCanonicalOrder,
  buildOrderLine
};
