import { buildMerchantFulfillmentNodeEntry, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildMerchantFulfillmentNodeEntry({ id: 'MF-1', zona: 'centro' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-MF-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-mf-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'merchant_fulfillment') {
  console.error('El nodo merchant fulfillment no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo merchant fulfillment');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-merchant-fulfillment-node: OK');
