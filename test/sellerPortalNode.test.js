import { buildSellerPortalFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Seller portal fulfillment node', () => {
  test('construye un nodo seller portal canonico', () => {
    const result = buildSellerPortalFulfillmentNode({ id: 'SP-1', zona: 'centro' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('seller_portal');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['catalog']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildSellerPortalFulfillmentNode({ id: 'SP-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-SP-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-sp-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
