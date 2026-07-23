import { createAIConsumer, createDomainEventBus, createFulfillmentEngine } from '../src/domain/index.js';

describe('AI consumer', () => {
  test('genera una recomendacion sobre pedido.entregado sin alterar el productor', () => {
    const bus = createDomainEventBus();
    const ai = createAIConsumer({ logger: { info: () => {} } });

    bus.subscribe('pedido.entregado', (event) => {
      ai.onEvent(event);
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const result = engine.completeOrder({
      order: { id: 'PED_AI-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-ai', logistica: {} },
      uid: 'driver-ai',
      comision: 31,
      tarifaEntrega: 19
    });

    const insights = ai.getInsights();

    expect(result.ok).toBe(true);
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(insights).toHaveLength(1);
    expect(insights[0]).toMatchObject({
      event_tipo: 'pedido.entregado',
      aggregate_id: 'PED_AI-1',
      recommendation: 'reforzar analitica y notificacion del cierre',
      score: 1
    });
    expect(insights[0].inputs).toMatchObject({
      comision: 31,
      tarifaEntrega: 19
    });
    expect(engine.getState().events).toHaveLength(1);
  });
});
