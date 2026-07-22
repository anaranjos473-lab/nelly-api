import {
  buildAcceptedOrderPayload,
  buildCompletedOrderPayload,
  buildDriverOfflinePayload,
  buildDriverOnlinePayload,
  canAcceptOrder,
  canCompleteOrder,
  estadoOperativo,
  normalizeOrderState,
  ordersManagerApi
} from '../src/services/ordersManager.js';

describe('OrdersManager', () => {
  test('expone una API estable para pedidos', () => {
    expect(ordersManagerApi).toBeTruthy();
    expect(typeof ordersManagerApi.createOrdersManager).toBe('function');
    expect(typeof ordersManagerApi.normalizeOrderState).toBe('function');
  });

  test('normaliza estados operativos conocidos', () => {
    expect(normalizeOrderState(' listo ')).toBe('LISTO');
    expect(estadoOperativo('DESPACHO')).toBe('LISTO');
    expect(estadoOperativo('EN_REPARTO')).toBe('EN_CURSO');
    expect(estadoOperativo('FINALIZADO')).toBe('ENTREGADO');
  });

  test('autoriza aceptacion solo cuando el pedido esta listo y el driver es elegible', () => {
    const ok = canAcceptOrder({
      driver: { finanzas: { deuda_actual: 0, limite_deuda: 300 } },
      order: { estado_pedido: 'LISTO' },
      uid: 'driver-1'
    });

    expect(ok.ok).toBe(true);

    const blocked = canAcceptOrder({
      driver: { finanzas: { deuda_actual: 301, limite_deuda: 300 } },
      order: { estado_pedido: 'LISTO' },
      uid: 'driver-1'
    });

    expect(blocked.ok).toBe(false);
    expect(blocked.status).toBe(403);
  });

  test('arma el payload de aceptacion y cierre sin perder campos operativos', () => {
    const accepted = buildAcceptedOrderPayload({ id: 'PED_1', estado_pedido: 'LISTO' }, 'driver-1', 123);
    expect(accepted.estado_pedido).toBe('EN_CURSO');
    expect(accepted.logistica.asignacion_activa).toBe(true);

    const completed = buildCompletedOrderPayload({ estado_pedido: 'EN_CURSO', logistica: {} }, 456, 'normal', 30, 18);
    expect(completed.estado_pedido).toBe('ENTREGADO');
    expect(completed.logistica.asignacion_activa).toBe(false);
    expect(completed.ganancia_neta).toBe(30);
    expect(completed.tarifa_entrega).toBe(18);
  });

  test('construye payloads para estado online/offline del conductor', () => {
    const offline = buildDriverOfflinePayload('driver-1', 1000);
    expect(offline['repartidores/driver-1/estado']).toBe('OFFLINE');
    expect(offline['repartidores/driver-1/disponible']).toBe(false);

    const online = buildDriverOnlinePayload('driver-1', null, 2000);
    expect(online['repartidores/driver-1/estado']).toBe('DISPONIBLE');
    expect(online['repartidores/driver-1/pedido_activo']).toBeNull();
  });

  test('autoriza cierre solo cuando la orden esta en reparto o ya entregada', () => {
    const allowed = canCompleteOrder({
      order: { estado_pedido: 'EN_CURSO', conductorId: 'driver-1' },
      uid: 'driver-1',
      isPanel: false
    });
    expect(allowed.ok).toBe(true);

    const rejected = canCompleteOrder({
      order: { estado_pedido: 'LISTO', conductorId: 'driver-1' },
      uid: 'driver-1',
      isPanel: false
    });
    expect(rejected.ok).toBe(false);
    expect(rejected.status).toBe(409);
  });
});
