import { buildRetailFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Retail fulfillment node', () => {
  test('construye un nodo retail canonico', () => {
    const result = buildRetailFulfillmentNode({ id: 'RT-1', zona: 'oriente' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('retail');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['storefront']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildRetailFulfillmentNode({ id: 'RT-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-RT-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-rt-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
