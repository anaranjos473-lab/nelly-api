import { buildDispatchAssignmentPayload, buildSupportRescuePayload } from '../../src/services/agentSyncService.js';

const dispatch = buildDispatchAssignmentPayload('P1', 'D1', 100);
const rescue = buildSupportRescuePayload('P1', 'D1', 'listo', 100);

let ok = true;

if (dispatch['pedidos/P1']) {
  console.error('Dispatch sigue escribiendo el nodo completo del pedido');
  ok = false;
}

if (dispatch['pedidos/P1/estado'] !== 'EN_CURSO') {
  console.error('Dispatch no usa estado canonico');
  ok = false;
}

if (dispatch['pedidos/P1/conductorId'] !== 'D1') {
  console.error('Dispatch no escribe conductorId canonico');
  ok = false;
}

if (rescue['pedidos/P1'].estado !== 'LISTO') {
  console.error('Support rescue no usa estado canonico');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-agent-canonical: OK');
