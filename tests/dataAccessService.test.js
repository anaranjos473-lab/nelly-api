import { describe, expect, test } from '@jest/globals';
import { buildDataAccessContract } from '../src/services/dataAccessService.js';

describe('dataAccessService', () => {
  test('expone contratos de lectura por capa', () => {
    const now = new Date('2026-07-30T12:00:00-06:00').getTime();
    const contract = buildDataAccessContract([
      {
        id: 'A1',
        estado: 'PENDIENTE',
        createdAt: new Date('2026-07-30T09:00:00-06:00').getTime(),
        comercio_nombre: 'Lidos Pizza',
        cliente_nombre: 'Juan Perez',
        repartidor_nombre: 'Alberto',
        metodo_pago: 'Efectivo',
        monto: 120
      },
      {
        id: 'B1',
        estado: 'ENTREGADO',
        createdAt: new Date('2026-07-22T09:00:00-06:00').getTime(),
        entregado_en: new Date('2026-07-22T10:00:00-06:00').getTime(),
        comercio_nombre: 'Lidos Pizza',
        cliente_nombre: 'Maria Lopez',
        repartidor_nombre: 'Rocio',
        metodo_pago: 'Tarjeta',
        monto: 220
      }
    ], now);

    expect(contract.getActiveOrders()).toHaveLength(1);
    expect(contract.getTodayOrders()).toHaveLength(0);
    expect(contract.getHistoricalOrders()).toHaveLength(1);
    expect(contract.getMonthlySummary()).toHaveLength(1);
    expect(contract.getAnnualSummary()[0].pedidos).toBe(2);
    expect(contract.getAuditIndex().history_index.comercio['Lidos Pizza']).toBe(1);
  });
});
