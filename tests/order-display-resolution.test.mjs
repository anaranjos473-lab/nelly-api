import { getRenderManager, resolveOrderAmount, resolveOrderProducts } from '../public/js/premium-kitchen/render/render-manager.js';

describe('order display resolution', () => {
  test.each([
    [{ monto: 165.5, total: 165.5, monto_total: 165.5 }, 165.5, false],
    [{ monto: 0, total: 165.5, monto_total: 165.5 }, 165.5, true],
    [{ monto: '0', total: 165.5, monto_total: 165.5 }, 165.5, true],
    [{ total: 165.5, monto_total: 165.5 }, 165.5, false],
    [{ monto: 0, total: 0, monto_total: 0 }, 0, false],
    [{}, 0, false]
  ])('resuelve importe %j', (pedido, expected, conflict) => {
    expect(resolveOrderAmount(pedido)).toMatchObject({ value: expected, conflict });
  });

  test.each([
    [{ items: [{ nombre: 'Item' }], productos: [{ nombre: 'Producto' }] }, 'items', 1],
    [{ items: [], productos: [{ nombre: 'Producto' }] }, 'productos', 1],
    [{ productos: [{ nombre: 'Producto' }] }, 'productos', 1],
    [{ items: [], productos: [] }, null, 0],
    [{}, null, 0]
  ])('resuelve productos %j', (pedido, source, length) => {
    expect(resolveOrderProducts(pedido)).toMatchObject({ source });
    expect(resolveOrderProducts(pedido).value).toHaveLength(length);
  });

  test.each([
    [{ monto: '0', total: 165.5, monto_total: 165.5, productos: [{ nombre: 'Cafe Starbucks' }] }, '165.50', 'Cafe Starbucks'],
    [{ items: [], productos: [{ nombre: 'Cafe Starbucks' }], monto: 42, total: 42 }, '42.00', 'Cafe Starbucks'],
    [{ items: [{ nombre: 'Cafe Starbucks' }], monto: 42, total: 42 }, '42.00', 'Cafe Starbucks']
  ])('renderiza tarjeta con resolucion compartida %j', (pedido, amountText, productText) => {
    const html = getRenderManager().renderOrderCard(pedido, 'PED_TEST', false);
    expect(html).toContain(amountText);
    expect(html).toContain(productText);
    expect(html).not.toContain('Sin productos');
  });
});
