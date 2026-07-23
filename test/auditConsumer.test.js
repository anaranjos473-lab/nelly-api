import { createAuditConsumer, createDomainEventBus, createFulfillmentEngine } from '../src/domain/index.js';

describe('Audit consumer', () => {
  test('registra pedido.entregado sin alterar el productor', () => {
    const bus = createDomainEventBus();
    const audit = createAuditConsumer({ logger: { info: () => {} } });
    const records = [];

    bus.subscribe('pedido.entregado', (event) => {
      records.push(audit.onEvent(event));
    });

    const engine = createFulfillmentEngine({ eventBus: bus, clock: () => 1000 });
    const result = engine.completeOrder({
      order: { id: 'PED_AUD-1', estado_pedido: 'EN_CURSO', conductorId: 'driver-aud', logistica: {} },
      uid: 'driver-aud',
      comision: 40,
      tarifaEntrega: 12
    });

    expect(result.ok).toBe(true);
    expect(result.event.tipo).toBe('pedido.entregado');
    expect(records).toHaveLength(1);
    expect(audit.getRecords()).toHaveLength(1);
    expect(audit.getRecords()[0]).toMatchObject({
      tipo: 'pedido.entregado',
      aggregate_id: 'PED_AUD-1',
      contract_version: '1.0.0'
    });
    expect(engine.getState().events).toHaveLength(1);
  });
});
