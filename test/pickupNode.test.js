import { buildPickupFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Pickup fulfillment node', () => {
  test('construye un nodo pickup canonico', () => {
    const result = buildPickupFulfillmentNode({ id: 'PU-1', zona: 'poniente' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('pickup');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['collection']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildPickupFulfillmentNode({ id: 'PU-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-PU-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-pu-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
