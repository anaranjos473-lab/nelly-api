import { createFulfillmentEngine } from '../src/domain/index.js';

describe('Fulfillment engine', () => {
  test('acepta pedidos usando contratos, estados y eventos', () => {
    const engine = createFulfillmentEngine({
      clock: () => 1000
    });

    const result = engine.acceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { id: 'PED_1', estado_pedido: 'LISTO' },
      uid: 'driver-1'
    });

    expect(result.ok).toBe(true);
    expect(result.order.estado_pedido).toBe('EN_CURSO');
    expect(result.event.tipo).toBe('pedido.en_proceso');
    expect(engine.getState().events).toHaveLength(1);
  });

  test('completa pedidos y registra ledger derivado', () => {
    const engine = createFulfillmentEngine({
      clock: () => 2000
    });

    const result = engine.completeOrder({
      order: { id: 'PED_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-1', logistica: {} },
      uid: 'driver-1',
      comision: 30,
      tarifaEntrega: 18
    });

    expect(result.ok).toBe(true);
    expect(result.order.estado_pedido).toBe('ENTREGADO');
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(result.ledgerEntry.monto).toBe(30);
    expect(engine.getState().ledger).toHaveLength(1);
    expect(engine.getState().balance).toBe(30);
  });
});
