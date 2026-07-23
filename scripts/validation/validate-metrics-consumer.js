import { createDomainEventBus, createFulfillmentEngine, createMetricsConsumer } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const metrics = createMetricsConsumer({ logger: { info: () => {} } });

bus.subscribe('pedido.entregado', (event) => {
  metrics.onEvent(event);
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const result = engine.completeOrder({
  order: { id: 'PED_METRICS_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-metrics', logistica: {} },
  uid: 'driver-metrics',
  comision: 20,
  tarifaEntrega: 10
});

let ok = true;

if (!result.ok) {
  console.error('El flujo de entrega no pudo completarse');
  ok = false;
}

const snapshot = metrics.getMetrics();
if (snapshot.pedido_entregado !== 1 || snapshot.total_eventos !== 1) {
  console.error('El consumidor de metricas no contabilizo correctamente el evento');
  ok = false;
}

if (snapshot.ultimos_eventos.length !== 1 || snapshot.ultimos_eventos[0]?.tipo !== 'pedido.entregado') {
  console.error('El historial de metricas no corresponde al evento esperado');
  ok = false;
}

if (result.event.tipo !== 'pedido.entregado') {
  console.error('El productor del evento cambio inesperadamente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-metrics-consumer: OK');
