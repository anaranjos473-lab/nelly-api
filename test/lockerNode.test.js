import { buildLockerFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Locker fulfillment node', () => {
  test('construye un nodo locker canonico', () => {
    const result = buildLockerFulfillmentNode({ id: 'LK-1', zona: 'norte' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('locker');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['dropoff']));
  });

  test('opera con el mismo fulfillment engine', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildLockerFulfillmentNode({ id: 'LK-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-LK-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-lk-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
