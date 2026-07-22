import { buildWarehouseFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Warehouse fulfillment node', () => {
  test('construye un nodo de almacen canonico', () => {
    const result = buildWarehouseFulfillmentNode({ id: 'WH-1', zona: 'poniente' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('warehouse');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['receiving']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildWarehouseFulfillmentNode({ id: 'WH-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-WH-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-wh-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
