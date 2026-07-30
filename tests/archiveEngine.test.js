import { describe, expect, test } from '@jest/globals';
import { buildArchiveEngineSnapshot, classifyOrderCycle } from '../src/services/archiveEngine.js';

describe('archiveEngine', () => {
  test('clasifica pedidos por ciclo de vida', () => {
    const now = new Date('2026-07-30T12:00:00-06:00').getTime();
    const active = classifyOrderCycle({
      estado: 'PENDIENTE',
      createdAt: new Date('2026-07-30T10:00:00-06:00').getTime()
    }, now);
    const history = classifyOrderCycle({
      estado: 'ENTREGADO',
      createdAt: new Date('2026-07-22T10:00:00-06:00').getTime(),
      entregado_en: new Date('2026-07-22T11:00:00-06:00').getTime()
    }, now);
    const today = classifyOrderCycle({
      estado: 'ENTREGADO',
      createdAt: new Date('2026-07-30T08:00:00-06:00').getTime(),
      entregado_en: new Date('2026-07-30T11:00:00-06:00').getTime()
    }, now);

    expect(active.bucket).toBe('active');
    expect(history.bucket).toBe('history');
    expect(today.bucket).toBe('today');
  });

  test('construye indice mensual y separa colecciones', () => {
    const now = new Date('2026-07-30T12:00:00-06:00').getTime();
    const snapshot = buildArchiveEngineSnapshot([
      {
        id: 'A1',
        estado: 'PENDIENTE',
        createdAt: new Date('2026-07-30T10:00:00-06:00').getTime(),
        monto: 120
      },
      {
        id: 'B1',
        estado: 'ENTREGADO',
        createdAt: new Date('2026-07-22T10:00:00-06:00').getTime(),
        entregado_en: new Date('2026-07-22T11:00:00-06:00').getTime(),
        monto: 220
      }
    ], now);

    expect(snapshot.summary.total).toBe(2);
    expect(snapshot.summary.active).toBe(1);
    expect(snapshot.summary.history).toBe(1);
    expect(snapshot.monthly_index[0].period).toBe('2026-07');
    expect(snapshot.monthly_index[0].pedidos).toBe(2);
  });
});
