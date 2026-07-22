import {
  buildCanonicalOrderRecord,
  buildPersistedOrderRecord,
  normalizeOrderCreationInput
} from '../src/services/orderCreationService.js';

describe('orderCreationService', () => {
  test('normalizeOrderCreationInput trims and coerces canonical input', () => {
    const normalized = normalizeOrderCreationInput({
      userId: '  user-1  ',
      items: [{ id: 'A' }],
      total: '12.5',
      estado: '  creado  '
    });

    expect(normalized.userId).toBe('user-1');
    expect(normalized.total).toBe(12.5);
    expect(normalized.estado).toBe('CREADO');
  });

  test('buildCanonicalOrderRecord returns canonical order and validation', () => {
    const record = buildCanonicalOrderRecord({
      userId: 'user-1',
      items: [{ id: 'A', nombre: 'A', cantidad: 1, precio: 10 }],
      total: 10,
      estado: 'CREADO'
    });

    expect(record.canonical.validation.ok).toBe(true);
    expect(record.canonical.order.estado).toBe('CREADO');
  });

  test('buildPersistedOrderRecord adds the provided id to canonical order', () => {
    const record = buildPersistedOrderRecord({
      id: 'ORD-1',
      input: {
        userId: 'user-1',
        items: [{ id: 'A', nombre: 'A', cantidad: 1, precio: 10 }],
        total: 10,
        estado: 'CREADO'
      }
    });

    expect(record.id).toBe('ORD-1');
    expect(record.estado).toBe('CREADO');
  });
});
