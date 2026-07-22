import { buildLockerFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildLockerFulfillmentNode({ id: 'LK-1', zona: 'norte' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-LK-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-lk-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'locker') {
  console.error('El nodo locker no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo locker');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-locker-node: OK');
