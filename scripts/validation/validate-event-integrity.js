import { createDomainEventBus, createFulfillmentEngine } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
const seen = [];

bus.subscribe('*', (event) => {
  seen.push(event);
});

const accepted = engine.acceptOrder({
  driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
  order: { id: 'PED_1', estado_pedido: 'LISTO' },
  uid: 'driver-1'
});
const completed = engine.completeOrder({
  order: { id: 'PED_1', estado_pedido: 'EN_CURSO', conductorId: 'driver-1', logistica: {} },
  uid: 'driver-1',
  comision: 30,
  tarifaEntrega: 18
});

let ok = true;

if (!accepted.ok || !completed.ok) {
  console.error('El engine no completo la secuencia');
  ok = false;
}

if (seen.length !== 2) {
  console.error('Los eventos no se emitieron exactamente una vez');
  ok = false;
}

if (!seen.every((event) => event.validation.ok && event.metadata.source)) {
  console.error('Hay eventos sin trazabilidad');
  ok = false;
}

if (engine.getState().ledger.length !== 1) {
  console.error('El ledger no quedo asociado al evento correspondiente');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-event-integrity: OK');
