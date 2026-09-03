import { createLedger, createLedgerEntry, projectLedger } from '../src/domain/index.js';

describe('Ledger domain', () => {
  test('crea entradas contables validadas', () => {
    const entry = createLedgerEntry({
      tipo: 'cargo',
      subtipo: 'pedido_entregado',
      referencia_id: 'ORD-1',
      actor_id: 'driver-1',
      monto: 30,
      saldo_antes: 100,
      idempotency_key: 'PAGO_REPARTIDOR:ORD-1',
      ocurrido_en: 1,
      registrado_en: 1
    });

    expect(entry.validation.ok).toBe(true);
    expect(entry.saldo_despues).toBe(130);
  });

  test('mantiene un libro append-only y reconciliable', () => {
    const ledger = createLedger([
      {
        tipo: 'cargo',
        subtipo: 'pedido_entregado',
        referencia_id: 'ORD-1',
        monto: 30,
        saldo_antes: 100,
        idempotency_key: 'PAGO_REPARTIDOR:ORD-1',
        ocurrido_en: 1,
        registrado_en: 1
      }
    ]);

    const appended = ledger.append({
      tipo: 'abono',
      subtipo: 'ajuste',
      referencia_id: 'ORD-1',
      monto: -10,
      idempotency_key: 'AJUSTE_MANUAL:ORD-1',
      ocurrido_en: 2,
      registrado_en: 2
    });

    expect(ledger.getEntries()).toHaveLength(2);
    expect(ledger.getBalance()).toBe(20);
    expect(appended.validation.ok).toBe(true);
    expect(ledger.reconcile(20).ok).toBe(true);
  });

  test('proyecta saldos desde el historial', () => {
    const projection = projectLedger([
      { monto: 50 },
      { monto: -15 }
    ]);

    expect(projection.balance).toBe(35);
    expect(projection.count).toBe(2);
  });
});
