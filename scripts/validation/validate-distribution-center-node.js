import { buildDistributionCenterFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildDistributionCenterFulfillmentNode({ id: 'DC-1', zona: 'norte' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-DC-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-dc-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'distribution_center') {
  console.error('El nodo distribution center no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo distribution center');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-distribution-center-node: OK');
