import { buildNotificationProjection } from '../../src/integrations/index.js';

const projection = buildNotificationProjection([
  { id: 'NT-1', channel: 'EMAIL', message: 'Hola', active: true },
  { id: 'NT-2', channel: 'SMS', message: 'Mundo', active: false }
]);

let ok = true;

if (!projection.ok || projection.summary.active !== 1 || projection.summary.byChannel.email !== 1 || projection.summary.byChannel.sms !== 1) {
  console.error('La proyeccion de notificaciones no es valida');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-notification-adapter: OK');
