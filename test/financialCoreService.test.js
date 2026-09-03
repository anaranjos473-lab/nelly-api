import {
  appendFinancialEntry,
  assertCompatibleEntry,
  buildFinancialEntry,
  projectDerivedFinance
} from '../src/services/financialCoreService.js';
import { registrarCobroEfectivoTx } from '../src/services/debtLockService.js';

function createDbMock(initial = {}) {
  const state = structuredClone(initial);
  const getAt = (path) => String(path).split('/').filter(Boolean)
    .reduce((current, part) => current?.[part], state);
  const setAt = (path, value) => {
    const parts = String(path).split('/').filter(Boolean);
    const last = parts.pop();
    const parent = parts.reduce((current, part) => {
      current[part] = current[part] || {};
      return current[part];
    }, state);
    parent[last] = value;
  };

  return {
    state,
    ref: (path = '') => ({
      once: async () => ({ val: () => getAt(path) || null }),
      transaction: async (updater) => {
        const next = updater(getAt(path) || null);
        if (next === null || next === undefined) {
          return { committed: false, snapshot: { val: () => getAt(path) || null } };
        }
        setAt(path, next);
        return { committed: true, snapshot: { val: () => next } };
      },
      update: async (value) => {
        Object.entries(value || {}).forEach(([key, item]) => setAt(`${path}/${key}`, item));
      }
    })
  };
}

describe('Financial Core', () => {
  test('genera entryId determinista y timestamp canonico', () => {
    const entryA = buildFinancialEntry({
      tipo: 'COMISION_NELLY',
      origen: 'complete-order',
      referencia_id: 'PED_123',
      actor_id: 'DRIVER_1',
      monto: -3,
      ocurrido_en: 1000,
      registrado_en: 1000
    });
    const entryB = buildFinancialEntry({
      tipo: 'COMISION_NELLY',
      origen: 'retry',
      referencia_id: 'PED_123',
      actor_id: 'DRIVER_1',
      monto: -3,
      ocurrido_en: 2000,
      registrado_en: 2000
    });

    expect(entryA.id).toBe(entryB.id);
    expect(entryA.idempotency_key).toBe('COMISION_NELLY:PED_123');
    expect(entryA.ocurrido_en).toBe(1000);
    expect(entryA.validation.ok).toBe(true);
  });

  test('rechaza reintento con datos financieros incompatibles', () => {
    const entry = buildFinancialEntry({
      tipo: 'COMISION_NELLY',
      origen: 'complete-order',
      referencia_id: 'PED_123',
      actor_id: 'DRIVER_1',
      monto: -3
    });
    expect(() => assertCompatibleEntry(entry, { ...entry, monto: -4 })).toThrow('IDEMPOTENCY_CONFLICT');
  });

  test('registra una sola entrada y no duplica el saldo en un reintento', async () => {
    const db = createDbMock({ repartidores: { DRIVER_1: { finanzas: {} } } });
    const entry = buildFinancialEntry({
      tipo: 'COMISION_NELLY',
      origen: 'complete-order',
      referencia_id: 'PED_123',
      actor_id: 'DRIVER_1',
      monto: -3
    });

    const first = await appendFinancialEntry(db, entry);
    const retry = await appendFinancialEntry(db, entry);

    expect(first.created).toBe(true);
    expect(retry.created).toBe(false);
    expect(db.state.ledger[entry.id]).toMatchObject({ idempotency_key: entry.idempotency_key, monto: -3 });
    expect(db.state.repartidores.DRIVER_1.finanzas.saldo_ganancias).toBe(-3);
    expect(db.state.repartidores.DRIVER_1.finanzas.deuda_actual).toBe(3);
  });

  test('reconstruye la proyeccion si el ledger existia antes del reintento', async () => {
    const db = createDbMock({ repartidores: { DRIVER_1: { finanzas: {} } } });
    const entry = buildFinancialEntry({
      tipo: 'COMISION_NELLY',
      origen: 'complete-order',
      referencia_id: 'PED_RECOVERY',
      actor_id: 'DRIVER_1',
      monto: -4
    });
    db.state.ledger = { [entry.id]: entry };

    const result = await appendFinancialEntry(db, entry);

    expect(result.created).toBe(false);
    expect(db.state.repartidores.DRIVER_1.finanzas.saldo_ganancias).toBe(-4);
    expect(db.state.repartidores.DRIVER_1.finanzas.deuda_actual).toBe(4);
    expect(db.state.repartidores.DRIVER_1.finanzas.ledger_aplicado[entry.id]).toBe(true);
  });

  test('registrar cobro en efectivo solo afecta custodia', async () => {
    const db = createDbMock({
      repartidores: {
        DRIVER_1: { finanzas: { saldo_ganancias: 12, deuda_actual: 3 } }
      }
    });

    await registrarCobroEfectivoTx(db, {
      uid: 'DRIVER_1',
      montoEfectivo: 180,
      pedidoId: 'PED_CASH'
    });

    expect(db.state.repartidores.DRIVER_1.finanzas.saldo_efectivo).toBe(180);
    expect(db.state.repartidores.DRIVER_1.finanzas.saldo_ganancias).toBe(12);
    expect(db.state.repartidores.DRIVER_1.finanzas.deuda_actual).toBe(3);
    expect(Object.values(db.state.ledger)[0].tipo).toBe('COBRO_EFECTIVO');
  });

  test('mantiene efectivo separado de ganancias', () => {
    const result = projectDerivedFinance({ finanzas: { saldo_ganancias: 20, saldo_efectivo: 0 } }, {
      tipo: 'COBRO_EFECTIVO',
      monto: 180
    });

    expect(result.finanzas.saldo_efectivo).toBe(180);
    expect(result.finanzas.saldo_ganancias).toBe(20);
  });
});
