import { buildDeliveryHubFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Delivery hub fulfillment node', () => {
  test('construye un nodo delivery hub canonico', () => {
    const result = buildDeliveryHubFulfillmentNode({ id: 'DH-1', zona: 'norte' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('delivery_hub');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['consolidation']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildDeliveryHubFulfillmentNode({ id: 'DH-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-DH-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-dh-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
