import { buildSupportRescuePayload, buildDispatchAssignmentPayload } from '../../src/services/agentSyncService.js';
import { buildTransitionSyncWrites } from '../../src/services/orderSyncService.js';

const rescue = buildSupportRescuePayload('P1', 'D1', 'listo', 100);
const dispatch = buildDispatchAssignmentPayload('P1', 'D1', 100);
const writes = buildTransitionSyncWrites('P1', 'entregado', { estado: 'EN_CURSO' });

let ok = true;

if (rescue['pedidos/P1'].estado !== 'LISTO') {
  console.error('El rescue de soporte no normaliza el estado');
  ok = false;
}

if (dispatch['pedidos/P1'].estado !== 'EN_CURSO') {
  console.error('La asignacion de dispatch no usa el estado canónico');
  ok = false;
}

if (writes['pedidos/P1/estado'] !== 'ENTREGADO') {
  console.error('La transicion de pedido no usa el estado canónico');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-sync-canonical: OK');
