import { describe, expect, test } from '@jest/globals';
import {
  allocateCommerceShortId,
  formatShortIdFromSequence,
  normalizeCommerceCode,
  resolveCommerceIdentity
} from '../src/services/orderShortIdService.js';

describe('orderShortIdService', () => {
  test('genera folios operativos cortos por comercio, fecha y consecutivo', () => {
    const timestamp = Date.UTC(2026, 7, 24, 21, 30, 0);

    expect(formatShortIdFromSequence(timestamp, 1, 'PIZZERIA-MIA')).toBe('PIZZERIA-MIA-260824-01');
    expect(formatShortIdFromSequence(timestamp, 2, 'PIZZERIA-MIA')).toBe('PIZZERIA-MIA-260824-02');
  });

  test('mantiene consecutivos de mas de dos digitos sin truncarlos', () => {
    const timestamp = Date.UTC(2026, 7, 24, 21, 30, 0);

    expect(formatShortIdFromSequence(timestamp, 100, 'COM001')).toBe('COM001-260824-100');
  });

  test('normaliza codigo visible del comercio sin depender del nombre libre', () => {
    expect(normalizeCommerceCode('Pizzeria Mia!')).toBe('PIZZERIA-MIA');
    expect(resolveCommerceIdentity({
      comercio_id: 'COM001',
      comercio_nombre: 'Pizzeria Mia'
    })).toMatchObject({
      commerceKey: 'com001',
      commerceCode: 'COM001',
      commerceName: 'Pizzeria Mia'
    });
  });

  test('asigna consecutivo persistente por comercio y dia usando transaccion RTDB', async () => {
    const timestamp = Date.UTC(2026, 7, 24, 21, 30, 0);
    const transactionCalls = [];
    const db = {
      ref(path) {
        transactionCalls.push({ path });
        return {
          async transaction(updateFn) {
            expect(updateFn(3)).toBe(4);
            return {
              committed: true,
              snapshot: {
                val: () => 4
              }
            };
          }
        };
      }
    };

    const allocation = await allocateCommerceShortId(db, {
      timestamp,
      commerceKey: 'Pizzeria Mia',
      commerceCode: 'PIZZERIA-MIA'
    });

    expect(transactionCalls).toEqual([
      { path: 'order_sequences/pizzeria_mia/2026-08-24' }
    ]);
    expect(allocation).toMatchObject({
      shortId: 'PIZZERIA-MIA-260824-04',
      commerceKey: 'pizzeria_mia',
      commerceCode: 'PIZZERIA-MIA',
      sequence: 4,
      day: '2026-08-24'
    });
  });
});
