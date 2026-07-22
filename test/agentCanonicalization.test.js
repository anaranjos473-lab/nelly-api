import { buildDispatchAssignmentPayload, buildSupportRescuePayload } from '../src/services/agentSyncService.js';

describe('Agent canonicalization', () => {
  test('dispatch assignment uses canonical order state', () => {
    const payload = buildDispatchAssignmentPayload('P1', 'D1', 100);
    expect(payload['pedidos/P1'].estado).toBe('EN_CURSO');
  });

  test('support rescue uses canonical order state', () => {
    const payload = buildSupportRescuePayload('P1', 'D1', 'listo', 100);
    expect(payload['pedidos/P1'].estado).toBe('LISTO');
  });
});
