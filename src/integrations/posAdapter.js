import { validateOrder } from '../domain/contracts/order.js';
import { normalizeState } from '../domain/stateMachine.js';

function normalizePosOrder(order = {}) {
  const total = Number(order.total ?? order.subtotal ?? 0);
  const subtotal = Number(order.subtotal ?? total);

  return {
    ...order,
    estado: normalizeState(order.estado),
    total,
    subtotal
  };
}

function buildPosProjection(orders = []) {
  const normalizedOrders = orders.map(normalizePosOrder);
  const validation = normalizedOrders.map((order) => ({
    id: order.id,
    validation: validateOrder({
      id: order.id,
      cliente: order.cliente || { id: order.cliente_id || order.clienteId || 'unknown' },
      lineas: Array.isArray(order.lineas) ? order.lineas : [],
      estado: order.estado || 'CREADO',
      created_at: order.created_at || order.fecha_creacion || Date.now(),
      updated_at: order.updated_at || order.fecha_actualizacion || Date.now(),
      metadata: order.metadata || {}
    })
  }));

  const ok = validation.every((entry) => entry.validation.ok);

  const summary = normalizedOrders.reduce((acc, order) => {
    acc.total += order.total;
    acc.byEstado[order.estado] = (acc.byEstado[order.estado] || 0) + 1;
    return acc;
  }, { total: 0, byEstado: {} });

  return {
    ok,
    summary,
    orders: normalizedOrders,
    validation
  };
}

export {
  normalizePosOrder,
  buildPosProjection
};
