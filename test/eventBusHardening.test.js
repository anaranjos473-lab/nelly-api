import { createAuditConsumer, createDomainEventBus, createFinanceConsumer, createFulfillmentEngine, createMetricsConsumer } from '../src/domain/index.js';

describe('Event bus hardening', () => {
  test('aisla fallos y evita duplicidad logica en consumidores', () => {
    const bus = createDomainEventBus();
    const audit = createAuditConsumer({ logger: { info: () => {} } });
    const metrics = createMetricsConsumer({ logger: { info: () => {} } });
    const finance = createFinanceConsumer({ logger: { info: () => {} } });
    const received = [];

    bus.subscribe('pedido.entregado', (event) => {
      received.push(audit.onEvent(event));
    });
    bus.subscribe('pedido.entregado', (event) => metrics.onEvent(event));
    bus.subscribe('pedido.entregado', (event) => finance.onEvent(event));
    bus.subscribe('pedido.entregado', () => {
      throw new Error('boom');
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const first = engine.completeOrder({
      order: { id: 'PED_HARD-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-hard', logistica: {} },
      uid: 'driver-hard',
      comision: 33,
      tarifaEntrega: 17
    });
    const second = bus.recordTransition({
      aggregate_id: 'PED_HARD-1',
      from: 'EN_TRANSITO',
      to: 'ENTREGADO',
      actor: { tipo: 'driver', uid: 'driver-hard' },
      payload: { comision: 33, tarifaEntrega: 17 }
    });

    expect(first.ok).toBe(true);
    expect(second.errors).toHaveLength(1);
    expect(received.filter(Boolean)).toHaveLength(1);
    expect(metrics.getMetrics().pedido_entregado).toBe(1);
    expect(metrics.getMetrics().total_eventos).toBe(1);
    expect(finance.getSnapshot().total_comision).toBe(33);
    expect(finance.getSnapshot().ledger).toHaveLength(1);
  });
});
