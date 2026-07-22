import { buildOrderUpdateRecord, normalizeOrderUpdateInput } from '../src/services/orderMutationService.js';

describe('orderMutationService', () => {
  test('normalizeOrderUpdateInput whitelists and normalizes updates', () => {
    const normalized = normalizeOrderUpdateInput({
      estado: ' listo ',
      estado_pedido: ' en_curso ',
      comision: '30',
      tarifa_entrega: '18',
      completion_type: ' NORMAL ',
      motivo_cierre: ' entrega_normal ',
      evidencia_url: ' https://example.com/evidence ',
      evidencia_fallback: true,
      evidencia_tipo: ' base64 ',
      evidencia_mime: ' image/jpeg ',
      timestampActualizacion: '1234',
      ignored: 'value'
    });

    expect(normalized.estado).toBe('LISTO');
    expect(normalized.estado_pedido).toBe('EN_CURSO');
    expect(normalized.comision).toBe(30);
    expect(normalized.tarifa_entrega).toBe(18);
    expect(normalized.completion_type).toBe('normal');
    expect(normalized.evidencia_fallback).toBe(true);
    expect(normalized.ignored).toBeUndefined();
  });

  test('buildOrderUpdateRecord adds timestamp for persisted mutations', () => {
    const before = Date.now();
    const record = buildOrderUpdateRecord({
      estado: 'ENTREGADO',
      completion_type: 'normal'
    });
    const after = Date.now();

    expect(record.estado).toBe('ENTREGADO');
    expect(record.updatedAt).toBeGreaterThanOrEqual(before);
    expect(record.updatedAt).toBeLessThanOrEqual(after);
  });
});
