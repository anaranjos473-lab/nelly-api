import { buildPickupFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildPickupFulfillmentNode({ id: 'PU-1', zona: 'poniente' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-PU-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-pu-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'pickup') {
  console.error('El nodo pickup no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo pickup');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-pickup-node: OK');
