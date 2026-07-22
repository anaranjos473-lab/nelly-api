import {
  canTransition,
  explainTransition,
  getStateEvent,
  getValidTransitions
} from '../src/domain/stateMachine.js';

describe('Order state machine', () => {
  test('expone transiciones validas de pedido', () => {
    expect(getValidTransitions('CREADO')).toEqual(expect.arrayContaining(['PAGADO', 'CANCELADO']));
    expect(canTransition('LISTO', 'ASIGNADO')).toBe(true);
    expect(canTransition('LISTO', 'ENTREGADO')).toBe(false);
  });

  test('mapea eventos de dominio por estado', () => {
    expect(getStateEvent('ENTREGADO')).toBe('pedido.entregado');
    expect(getStateEvent('CERRADO')).toBe('pedido.cerrado');
  });

  test('explica una transicion en forma auditable', () => {
    const result = explainTransition('EN_TRANSITO', 'ENTREGADO');
    expect(result.allowed).toBe(true);
    expect(result.event).toBe('pedido.entregado');
    expect(result.validTargets).toContain('ENTREGADO');
  });
});
