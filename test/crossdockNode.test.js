import { buildCrossdockFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Crossdock fulfillment node', () => {
  test('construye un nodo crossdock canonico', () => {
    const result = buildCrossdockFulfillmentNode({ id: 'XD-1', zona: 'sur' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('crossdock');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['transfer']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildCrossdockFulfillmentNode({ id: 'XD-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-XD-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-xd-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
