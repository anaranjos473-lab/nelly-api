import { createDomainEventBus, createFulfillmentEngine, createAuditConsumer } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const audit = createAuditConsumer({ logger: { info: () => {} } });
const seen = [];

bus.subscribe('pedido.entregado', (event) => {
  seen.push(audit.onEvent(event));
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });

const result = engine.completeOrder({
  order: { id: 'PED_AUDIT_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-audit', logistica: {} },
  uid: 'driver-audit',
  comision: 25,
  tarifaEntrega: 15
});

let ok = true;

if (!result.ok) {
  console.error('El flujo de entrega no pudo completarse');
  ok = false;
}

if (seen.length !== 1) {
  console.error('El consumidor de auditoria no recibio exactamente un evento');
  ok = false;
}

if (audit.getRecords().length !== 1) {
  console.error('El consumidor de auditoria no registro exactamente un evento');
  ok = false;
}

if (audit.getRecords()[0]?.tipo !== 'pedido.entregado') {
  console.error('El registro de auditoria no corresponde al evento esperado');
  ok = false;
}

if (result.event.tipo !== 'pedido.entregado') {
  console.error('El productor del evento cambio inesperadamente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-audit-consumer: OK');
