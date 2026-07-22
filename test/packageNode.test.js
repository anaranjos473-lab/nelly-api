import { buildPackageFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Package fulfillment node', () => {
  test('construye un nodo de paqueteria canónico', () => {
    const result = buildPackageFulfillmentNode({ id: 'PK-1', zona: 'sur' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('package');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['sorting']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildPackageFulfillmentNode({ id: 'PK-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-PK-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-pk-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
