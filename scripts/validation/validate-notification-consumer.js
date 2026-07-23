import { createDomainEventBus, createFulfillmentEngine, createNotificationConsumer } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const notification = createNotificationConsumer({ logger: { info: () => {} } });

bus.subscribe('pedido.entregado', (event) => {
  notification.onEvent(event);
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const result = engine.completeOrder({
  order: { id: 'PED_NOTIF_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-notif', logistica: {} },
  uid: 'driver-notif',
  comision: 30,
  tarifaEntrega: 12
});

let ok = true;

if (!result.ok) {
  console.error('El flujo de entrega no pudo completarse');
  ok = false;
}

const projection = notification.getProjection();
if (!projection.ok || projection.summary.active !== 1 || projection.summary.byChannel.push !== 1) {
  console.error('El consumidor de notificaciones no genero una proyeccion valida');
  ok = false;
}

if (notification.getNotifications().length !== 1 || notification.getNotifications()[0]?.channel !== 'push') {
  console.error('La notificacion no quedo registrada correctamente');
  ok = false;
}

if (result.event.tipo !== 'pedido.entregado') {
  console.error('El productor del evento cambio inesperadamente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-notification-consumer: OK');
