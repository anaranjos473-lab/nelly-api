import { createDomainEvent, createDomainEventBus } from '../../src/domain/index.js';

const bus = createDomainEventBus();
const seen = [];

bus.subscribe('pedido.entregado', (event) => {
  seen.push(event);
});

const event = bus.recordTransition({
  aggregate_id: 'ORD-1',
  from: 'EN_TRANSITO',
  to: 'ENTREGADO',
  actor: { tipo: 'driver', uid: 'driver-1' }
});

const emitted = createDomainEvent({
  tipo: 'pedido.listo',
  aggregate_id: 'ORD-2',
  payload: { state: 'LISTO' },
  source: 'validator'
});

let ok = true;

if (!event.validation.ok) {
  console.error('El evento de transicion no es valido');
  ok = false;
}

if (seen.length !== 1) {
  console.error('El bus no registro exactamente un listener');
  ok = false;
}

if (bus.getHistory().length !== 1) {
  console.error('El historial del bus no coincide');
  ok = false;
}

if (!emitted.validation.ok || emitted.metadata.contract_version !== '1.0.0') {
  console.error('El evento manual no cumple el contrato');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-domain-events: OK');
