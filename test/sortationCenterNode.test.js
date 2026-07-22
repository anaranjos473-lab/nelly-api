import { buildSortationCenterFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Sortation center fulfillment node', () => {
  test('construye un nodo sortation center canonico', () => {
    const result = buildSortationCenterFulfillmentNode({ id: 'SC-1', zona: 'norte' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('sortation_center');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['sorting']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildSortationCenterFulfillmentNode({ id: 'SC-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-SC-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-sc-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
