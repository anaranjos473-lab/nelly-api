import { createDomainEventBus, createFulfillmentEngine, createAuditConsumer, createMetricsConsumer, createFinanceConsumer } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const audit = createAuditConsumer({ logger: { info: () => {} } });
const metrics = createMetricsConsumer({ logger: { info: () => {} } });
const finance = createFinanceConsumer({ logger: { info: () => {} } });
const received = [];

bus.subscribe('pedido.entregado', (event) => {
  received.push(audit.onEvent(event));
});

bus.subscribe('pedido.entregado', (event) => {
  metrics.onEvent(event);
});

bus.subscribe('pedido.entregado', (event) => {
  finance.onEvent(event);
});

bus.subscribe('pedido.entregado', () => {
  throw new Error('fallo aislado de consumidor');
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const first = engine.completeOrder({
  order: { id: 'PED_HARD_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-hard', logistica: {} },
  uid: 'driver-hard',
  comision: 40,
  tarifaEntrega: 20
});
const second = bus.recordTransition({
  aggregate_id: 'PED_HARD_1',
  from: 'EN_TRANSITO',
  to: 'ENTREGADO',
  actor: { tipo: 'driver', uid: 'driver-hard' },
  payload: { comision: 40, tarifaEntrega: 20 }
});

let ok = true;

if (!first.ok) {
  console.error('El flujo inicial no pudo completarse');
  ok = false;
}

if (!second.errors || second.errors.length !== 1) {
  console.error('El bus no aislo correctamente el fallo del consumidor');
  ok = false;
}

if (received.filter(Boolean).length !== 1) {
  console.error('AuditConsumer duplico o perdio el evento');
  ok = false;
}

if (metrics.getMetrics().pedido_entregado !== 1 || metrics.getMetrics().total_eventos !== 1) {
  console.error('MetricsConsumer no fue idempotente');
  ok = false;
}

if (finance.getSnapshot().total_comision !== 40 || finance.getSnapshot().ledger.length !== 1) {
  console.error('FinanceConsumer no fue idempotente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-event-bus-hardening: OK');
