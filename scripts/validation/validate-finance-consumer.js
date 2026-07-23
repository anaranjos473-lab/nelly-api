import { createDomainEventBus, createFulfillmentEngine, createFinanceConsumer } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const finance = createFinanceConsumer({ logger: { info: () => {} } });

bus.subscribe('pedido.entregado', (event) => {
  finance.onEvent(event);
});

const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const result = engine.completeOrder({
  order: { id: 'PED_FIN_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-finance', logistica: {} },
  uid: 'driver-finance',
  comision: 35,
  tarifaEntrega: 15
});

let ok = true;

if (!result.ok) {
  console.error('El flujo de entrega no pudo completarse');
  ok = false;
}

const snapshot = finance.getSnapshot();
if (snapshot.total_comision !== 35 || snapshot.total_tarifa_entrega !== 15 || snapshot.total_eventos !== 1) {
  console.error('El consumidor financiero no contabilizo correctamente el evento');
  ok = false;
}

if (snapshot.ledger.length !== 1 || snapshot.ledger[0]?.aggregate_id !== 'PED_FIN_1') {
  console.error('El ledger financiero proyectado no quedo registrado');
  ok = false;
}

if (result.event.tipo !== 'pedido.entregado') {
  console.error('El productor del evento cambio inesperadamente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-finance-consumer: OK');
