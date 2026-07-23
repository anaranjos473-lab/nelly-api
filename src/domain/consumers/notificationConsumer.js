import { buildNotificationProjection } from '../../integrations/index.js';
import { createEventConsumerGuard } from './consumerGuard.js';

function createNotificationConsumer({ logger = console } = {}) {
  const notifications = [];
  const guard = createEventConsumerGuard({ logger, name: 'NotificationConsumer' });

  function onEvent(event) {
    const gate = guard.shouldProcess(event);
    if (!gate.ok) {
      return null;
    }

    if (event?.tipo === 'pedido.entregado') {
      notifications.push({
        id: `NT-${event?.aggregate_id || 'UNKNOWN'}`,
        channel: 'push',
        message: `Pedido ${event?.aggregate_id || 'desconocido'} entregado`,
        active: true,
        event_tipo: event?.tipo || null,
        aggregate_id: event?.aggregate_id || null,
        source: event?.metadata?.source || null,
        contract_version: event?.metadata?.contract_version || null
      });
    }

    logger.info?.('[NotificationConsumer]', JSON.stringify(getProjection()));
    return getProjection();
  }

  function getProjection() {
    return buildNotificationProjection(notifications);
  }

  function getNotifications() {
    return [...notifications];
  }

  return {
    onEvent,
    getProjection,
    getNotifications
  };
}

export {
  createNotificationConsumer
};
