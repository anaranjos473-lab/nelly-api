import { createDomainEvent, createDomainEventBus } from '../src/domain/index.js';

describe('Domain event bus', () => {
  test('crea eventos canonicos validados', () => {
    const event = createDomainEvent({
      tipo: 'pedido.entregado',
      aggregate_id: 'ORD-1',
      payload: { estado: 'ENTREGADO' },
      source: 'test'
    });

    expect(event.validation.ok).toBe(true);
    expect(event.metadata.contract_version).toBe('1.0.0');
    expect(event.tipo).toBe('pedido.entregado');
  });

  test('publica, escucha y registra transiciones', () => {
    const bus = createDomainEventBus();
    const received = [];
    const unsubscribe = bus.subscribe('pedido.entregado', (event) => received.push(event));

    const event = bus.recordTransition({
      aggregate_id: 'ORD-1',
      from: 'EN_TRANSITO',
      to: 'ENTREGADO',
      actor: { tipo: 'driver', uid: 'drv-1' }
    });

    expect(event.tipo).toBe('pedido.entregado');
    expect(received).toHaveLength(1);
    expect(bus.getHistory()).toHaveLength(1);
    expect(bus.getHistory()[0].payload.to).toBe('ENTREGADO');

    unsubscribe();
  });
});
