import { buildPharmacyFulfillmentNode, createFulfillmentEngine } from '../src/domain/index.js';

describe('Pharmacy fulfillment node', () => {
  test('construye un nodo de farmacia canónico', () => {
    const result = buildPharmacyFulfillmentNode({ id: 'PH-1', zona: 'norte' });

    expect(result.validation.ok).toBe(true);
    expect(result.node.tipo).toBe('pharmacy');
    expect(result.node.estado).toBe('DISPONIBLE');
    expect(result.node.capabilities).toEqual(expect.arrayContaining(['dispensacion']));
  });

  test('opera sobre el mismo fulfillment engine sin depender de Kitchen', () => {
    const engine = createFulfillmentEngine({ clock: () => 1000 });
    const node = buildPharmacyFulfillmentNode({ id: 'PH-1' });

    const accepted = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'ORD-PH-1', estado_pedido: 'LISTO', fulfillment: { node: node.node } },
      uid: 'drv-ph-1'
    });

    expect(node.validation.ok).toBe(true);
    expect(accepted.ok).toBe(true);
    expect(accepted.order.estado_pedido).toBe('EN_CURSO');
  });
});
