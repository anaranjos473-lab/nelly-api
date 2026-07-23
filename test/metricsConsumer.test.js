import { createDomainEventBus, createFulfillmentEngine, createMetricsConsumer } from '../src/domain/index.js';

describe('Metrics consumer', () => {
  test('contabiliza pedido.entregado sin alterar el productor', () => {
    const bus = createDomainEventBus();
    const metrics = createMetricsConsumer({ logger: { info: () => {} } });

    bus.subscribe('pedido.entregado', (event) => {
      metrics.onEvent(event);
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const result = engine.completeOrder({
      order: { id: 'PED_MET-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-met', logistica: {} },
      uid: 'driver-met',
      comision: 22,
      tarifaEntrega: 8
    });

    const snapshot = metrics.getMetrics();

    expect(result.ok).toBe(true);
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(snapshot.pedido_entregado).toBe(1);
    expect(snapshot.total_eventos).toBe(1);
    expect(snapshot.ultimos_eventos).toHaveLength(1);
    expect(snapshot.ultimos_eventos[0]).toMatchObject({
      tipo: 'pedido.entregado',
      aggregate_id: 'PED_MET-1'
    });
    expect(engine.getState().events).toHaveLength(1);
  });
});
