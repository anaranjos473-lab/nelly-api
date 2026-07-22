import { buildWarehouseFulfillmentNode, createFulfillmentEngine } from '../../src/domain/index.js';

const node = buildWarehouseFulfillmentNode({ id: 'WH-1', zona: 'poniente' });
const engine = createFulfillmentEngine({ clock: () => 1000 });
const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'ORD-WH-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
  uid: 'drv-wh-1'
});

let ok = true;

if (!node.validation.ok || node.node.tipo !== 'warehouse') {
  console.error('El nodo de almacen no cumple el contrato');
  ok = false;
}

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('El engine no acepta pedidos sobre el nodo de almacen');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-warehouse-node: OK');
