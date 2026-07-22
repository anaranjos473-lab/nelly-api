import { buildPackageFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildPackageFulfillmentNode({ id: 'PK-1', zona: 'sur' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-PK-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-pk-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'package') {
  console.error('El nodo de paqueteria no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo de paqueteria');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-package-node: OK');
