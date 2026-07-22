import { buildDeliveryHubFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildDeliveryHubFulfillmentNode({ id: 'DH-1', zona: 'norte' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-DH-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-dh-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'delivery_hub') {
  console.error('El nodo delivery hub no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo delivery hub');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-delivery-hub-node: OK');
