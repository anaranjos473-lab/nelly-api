import { createDomainEventBus, createFulfillmentEngine, createNotificationConsumer } from '../src/domain/index.js';

describe('Notification consumer', () => {
  test('proyecta una notificacion push para pedido.entregado sin alterar el productor', () => {
    const bus = createDomainEventBus();
    const notification = createNotificationConsumer({ logger: { info: () => {} } });

    bus.subscribe('pedido.entregado', (event) => {
      notification.onEvent(event);
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const result = engine.completeOrder({
      order: { id: 'PED_NOT-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-not', logistica: {} },
      uid: 'driver-not',
      comision: 26,
      tarifaEntrega: 9
    });

    const projection = notification.getProjection();

    expect(result.ok).toBe(true);
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(projection.ok).toBe(true);
    expect(projection.summary.active).toBe(1);
    expect(projection.summary.byChannel.push).toBe(1);
    expect(notification.getNotifications()).toHaveLength(1);
    expect(notification.getNotifications()[0]).toMatchObject({
      id: 'NT-PED_NOT-1',
      channel: 'push',
      active: true,
      event_tipo: 'pedido.entregado'
    });
    expect(engine.getState().events).toHaveLength(1);
  });
});
