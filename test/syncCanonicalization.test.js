import { buildSupportRescuePayload, buildDispatchAssignmentPayload } from '../src/services/agentSyncService.js';
import { buildTransitionSyncWrites } from '../src/services/orderSyncService.js';

describe('Sync canonicalization', () => {
  test('normaliza estados de soporte al vocabulario canónico', () => {
    const rescue = buildSupportRescuePayload('P1', 'D1', 'listo', 100);
    const dispatch = buildDispatchAssignmentPayload('P1', 'D1', 100);

    expect(rescue['pedidos/P1'].estado).toBe('LISTO');
    expect(dispatch['pedidos/P1'].estado).toBe('EN_CURSO');
  });

  test('escribe transiciones con estados canónicos', () => {
    const writes = buildTransitionSyncWrites('P1', 'entregado', { estado: 'EN_CURSO' });
    expect(writes['pedidos/P1/estado']).toBe('ENTREGADO');
    expect(writes['pedidos_en_camino/P1'].estado).toBe('ENTREGADO');
  });
});
