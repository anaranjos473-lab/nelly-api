import { buildNotificationProjection, normalizeNotification } from '../src/integrations/index.js';

describe('notificationAdapter', () => {
  test('normaliza una notificacion', () => {
    const notification = normalizeNotification({ id: 'NT-1', channel: 'EMAIL', message: 'Hola', active: true });
    expect(notification.channel).toBe('email');
    expect(notification.message).toBe('Hola');
  });

  test('construye una proyeccion de notificaciones valida', () => {
    const projection = buildNotificationProjection([
      { id: 'NT-1', channel: 'EMAIL', message: 'Hola', active: true },
      { id: 'NT-2', channel: 'SMS', message: 'Mundo', active: false }
    ]);
    expect(projection.ok).toBe(true);
    expect(projection.summary.active).toBe(1);
    expect(projection.summary.byChannel.email).toBe(1);
    expect(projection.summary.byChannel.sms).toBe(1);
  });
});
