import { buildHandoffPointFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildHandoffPointFulfillmentNode({ id: 'HP-1', zona: 'sur' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-HP-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-hp-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'handoff_point') {
  console.error('El nodo handoff point no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo handoff point');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-handoff-point-node: OK');
