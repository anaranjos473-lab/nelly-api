import { buildMerchantFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Merchant fulfillment node', () => {
  test('construye un nodo merchant canonico', () => {
    const result = buildMerchantFulfillmentNode({ id: 'MR-1', zona: 'centro' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('merchant');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['catalog']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildMerchantFulfillmentNode({ id: 'MR-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-MR-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-mr-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
