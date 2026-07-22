import { createFulfillmentEngine } from '../../src/domain/index.js';

const engine = createFulfillmentEngine({ clock: () => 1000 });
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

if (!accepted.ok || accepted.order.estado_pedido !== 'EN_CURSO') {
  console.error('La aceptacion no pasa por la maquina de estados');
  ok = false;
}

if (!completed.ok || completed.order.estado_pedido !== 'ENTREGADO') {
  console.error('La finalizacion no pasa por el fulfillment engine');
  ok = false;
}

if (engine.getState().events.length !== 2) {
  console.error('El engine no registro exactamente dos eventos');
  ok = false;
}

if (engine.getState().ledger.length !== 1 || engine.getState().balance !== 30) {
  console.error('El ledger derivado no coincide');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-fulfillment-engine: OK');
