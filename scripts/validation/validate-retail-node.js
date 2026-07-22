import { buildRetailFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildRetailFulfillmentNode({ id: 'RT-1', zona: 'oriente' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-RT-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-rt-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'retail') {
  console.error('El nodo retail no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo retail');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-retail-node: OK');
