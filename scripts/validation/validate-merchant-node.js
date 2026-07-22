import { buildMerchantFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildMerchantFulfillmentNode({ id: 'MR-1', zona: 'centro' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-MR-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-mr-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'merchant') {
  console.error('El nodo merchant no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo merchant');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-merchant-node: OK');
