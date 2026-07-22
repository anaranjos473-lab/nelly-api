import { buildReturnsFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildReturnsFulfillmentNode({ id: 'RE-1', zona: 'centro' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-RE-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-re-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'returns') {
  console.error('El nodo returns no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo returns');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-returns-node: OK');
