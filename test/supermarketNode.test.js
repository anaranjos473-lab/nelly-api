import { buildSupermarketFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Supermarket fulfillment node', () => {
  test('construye un nodo de supermercado canónico', () => {
    const result = buildSupermarketFulfillmentNode({ id: 'SM-1', zona: 'centro' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('supermarket');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['picking']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildSupermarketFulfillmentNode({ id: 'SM-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-SM-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-sm-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
