import {
  buildDispatchAssignmentPayload,
  buildSupportInterventionPayload,
  buildSupportRescuePayload
} from '../src/services/agentSyncService.js';

describe('agentSyncService', () => {
  test('buildSupportInterventionPayload writes compensation fields', () => {
    const payload = buildSupportInterventionPayload('P1', 'Hola', 15);
    expect(payload['pedidos/P1/intervencionSoporte']).toBe(true);
    expect(payload['pedidos/P1/mensajeCliente']).toBe('Hola');
    expect(payload['pedidos/P1/bonoCompensacion']).toBe(15);
  });

  test('buildSupportRescuePayload resets pedido and pauses driver', () => {
    const payload = buildSupportRescuePayload('P1', 'D1', 'pendiente', 1000);
    expect(payload['pedidos/P1'].estado).toBe('pendiente');
    expect(payload['pedidos/P1'].conductorAnterior).toBe('D1');
    expect(payload['conductores_activos/D1'].estado).toBe('PAUSADO_POR_SOPORTE');
  });

  test('buildDispatchAssignmentPayload assigns driver in en_curso state', () => {
    const payload = buildDispatchAssignmentPayload('P1', 'D1', 1000);
    expect(payload['pedidos/P1'].conductorId).toBe('D1');
    expect(payload['pedidos/P1'].estado).toBe('en_curso');
    expect(payload['pedidos/P1'].timestampActualizacion).toBe(1000);
  });
});
