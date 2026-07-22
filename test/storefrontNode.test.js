import { buildStorefrontFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Storefront fulfillment node', () => {
  test('construye un nodo storefront canonico', () => {
    const result = buildStorefrontFulfillmentNode({ id: 'SF-1', zona: 'centro' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('storefront');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['pricing']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildStorefrontFulfillmentNode({ id: 'SF-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-SF-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-sf-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
