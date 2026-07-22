import { buildHandoffPointFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Handoff point fulfillment node', () => {
  test('construye un nodo handoff point canonico', () => {
    const result = buildHandoffPointFulfillmentNode({ id: 'HP-1', zona: 'sur' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('handoff_point');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['handoff']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildHandoffPointFulfillmentNode({ id: 'HP-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-HP-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-hp-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
