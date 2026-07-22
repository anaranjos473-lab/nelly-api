import { buildStorefrontFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildStorefrontFulfillmentNode({ id: 'SF-1', zona: 'centro' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-SF-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-sf-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'storefront') {
  console.error('El nodo storefront no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo storefront');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-storefront-node: OK');
