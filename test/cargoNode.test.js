import { buildCargoFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Cargo fulfillment node', () => {
  test('construye un nodo cargo canonico', () => {
    const result = buildCargoFulfillmentNode({ id: 'CG-1', zona: 'sur' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('cargo');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['receiving']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildCargoFulfillmentNode({ id: 'CG-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-CG-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-cg-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
