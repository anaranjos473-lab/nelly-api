import { buildReturnsFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Returns fulfillment node', () => {
  test('construye un nodo returns canonico', () => {
    const result = buildReturnsFulfillmentNode({ id: 'RE-1', zona: 'centro' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('returns');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['inspection']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildReturnsFulfillmentNode({ id: 'RE-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-RE-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-re-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
