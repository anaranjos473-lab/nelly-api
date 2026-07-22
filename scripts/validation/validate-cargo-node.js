import { buildCargoFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildCargoFulfillmentNode({ id: 'CG-1', zona: 'sur' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-CG-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-cg-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'cargo') {
  console.error('El nodo cargo no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo cargo');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-cargo-node: OK');
