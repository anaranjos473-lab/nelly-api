import { validateInventoryItem } from '../domain/contracts/inventoryItem.js';
import { validateOrder } from '../domain/contracts/order.js';

function normalizeErpProduct(product = {}) {
  return {
    ...product,
    stock: Number(product.stock ?? 0),
    reorder_point: Number(product.reorder_point ?? 0)
  };
}

function buildErpProjection({ products = [], orders = [] } = {}) {
  const normalizedProducts = products.map(normalizeErpProduct);
  const productValidation = normalizedProducts.map((product) => ({
    id: product.id,
    validation: validateInventoryItem({
      id: product.id,
      sku: product.sku,
      nodo_id: product.nodo_id || product.warehouse_id || 'unknown',
      disponible: product.stock,
      reservado: 0,
      total: product.stock,
      metadata: product.metadata || {},
      ubicacion: product.ubicacion || null
    })
  }));
  const orderValidation = orders.map((order) => ({
    id: order.id,
    validation: validateOrder({
      id: order.id,
      cliente: order.cliente || { id: order.cliente_id || 'unknown' },
      lineas: Array.isArray(order.lineas) ? order.lineas : [],
      estado: order.estado || 'CREADO',
      created_at: order.created_at || Date.now(),
      updated_at: order.updated_at || Date.now(),
      metadata: order.metadata || {}
    })
  }));

  const ok = [...productValidation, ...orderValidation].every((entry) => entry.validation.ok);

  return {
    ok,
    products: normalizedProducts,
    orders,
    validation: {
      products: productValidation,
      orders: orderValidation
    }
  };
}

export {
  normalizeErpProduct,
  buildErpProjection
};
