import { createDomainEventBus, createFulfillmentEngine, createFinanceConsumer } from '../src/domain/index.js';

describe('Finance consumer', () => {
  test('proyecta comision y tarifa de pedido.entregado sin alterar el productor', () => {
    const bus = createDomainEventBus();
    const finance = createFinanceConsumer({ logger: { info: () => {} } });

    bus.subscribe('pedido.entregado', (event) => {
      finance.onEvent(event);
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const result = engine.completeOrder({
      order: { id: 'PED_FIN-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-fin', logistica: {} },
      uid: 'driver-fin',
      comision: 28,
      tarifaEntrega: 14
    });

    const snapshot = finance.getSnapshot();

    expect(result.ok).toBe(true);
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(snapshot.total_comision).toBe(28);
    expect(snapshot.total_tarifa_entrega).toBe(14);
    expect(snapshot.total_eventos).toBe(1);
    expect(snapshot.ledger).toHaveLength(1);
    expect(snapshot.ledger[0]).toMatchObject({
      tipo: 'pedido_entregado',
      aggregate_id: 'PED_FIN-1',
      comision: 28,
      tarifaEntrega: 14
    });
    expect(engine.getState().events).toHaveLength(1);
  });
});
