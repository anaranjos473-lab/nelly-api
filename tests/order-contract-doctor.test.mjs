import { analyzeOrder, fieldState, mirrorPanelNormalizer, shapeOf } from '../scripts/order-contract-doctor.mjs';

describe('order-contract-doctor', () => {
  test('detecta MULTIPLE_SHAPES sin elegir forma canónica', () => {
    const origin = {
      id: 'PED-1',
      cliente: { nombre: 'Alberto' },
      comercio: { nombre: 'Starbucks' },
      lineas: [{ nombre: 'Producto', cantidad: 1 }],
      total: 165.5
    };
    const active = {
      id: 'PED-1',
      cliente_nombre: 'Alberto',
      comercio_nombre: 'Starbucks',
      items: [{ nombre: 'Producto', cantidad: 1 }],
      total: 165.5
    };
    const result = analyzeOrder(origin, active);
    expect(result.verdict).toBe('MULTIPLE_SHAPES');
    expect(result.renderer_rules.monetary_precedence).toEqual(['monto', 'total', 'monto_total']);
  });

  test('detecta pérdida de cliente/productos y precedencia monto=0', () => {
    const origin = { id: 'PED-2', monto: 0, total: 165.5, lineas: [{ nombre: 'Pizza' }] };
    const order = { id: 'PED-2', monto: 0, total: 165.5, lineas: [{ nombre: 'Pizza' }] };
    const result = analyzeOrder(origin, order);
    expect(result.verdict).toBe('MULTIPLE_CONSUMER_DEFECTS');
    expect(result.findings.map((item) => item.field)).toEqual(expect.arrayContaining(['customer', 'products', 'total']));
  });

  test('distingue null, vacío, tipo y estructura', () => {
    const state = fieldState({ cliente: null, items: [], total: 10 }, ['cliente', 'items', 'total', 'missing']);
    expect(state.aliases.map((item) => item.state)).toEqual(['NULL', 'EMPTY', 'PRESENT', 'ABSENT']);
    expect(shapeOf({ cliente: null, items: [] })).toBe('object{cliente,items}');
  });

  test('normalizador espejo no convierte lineas en productos', () => {
    const view = mirrorPanelNormalizer({ lineas: [{ nombre: 'Pizza' }] });
    expect(view.productos).toEqual([]);
    expect(view.total).toBe(0);
  });

  test('reporta FIRST LOSS en el consumidor cuando el contrato conserva el dato', () => {
    const order = { id: 'PED-3', cliente_nombre: 'Alberto', direccion: 'Oficina', comercio_nombre: 'Starbucks', lineas: [{ nombre: 'Cafe' }], total: 165.5 };
    const result = analyzeOrder(order, order);
    expect(result.verdict).toBe('MULTIPLE_CONSUMER_DEFECTS');
    expect(result.first_loss).toBe('normalizarPedidoParaVista');
  });
});
