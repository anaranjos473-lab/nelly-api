import {
  buildAcceptSyncWrites,
  buildCompleteSyncWrites,
  buildDriverOfflineSyncWrites,
  buildDriverOnlineSyncWrites,
  buildDispatchSyncWrites,
  buildLocationSyncWrites,
  buildTransitionSyncWrites
} from '../src/services/orderSyncService.js';

describe('orderSyncService', () => {
  test('buildDispatchSyncWrites mirrors pedido into available pool', () => {
    const payload = { id: 'P1', estado: 'LISTO' };
    const writes = buildDispatchSyncWrites('P1', {}, payload);
    expect(writes['pedidos/P1']).toEqual(payload);
    expect(writes['pedidos_para_reparto/P1']).toEqual(payload);
  });

  test('buildAcceptSyncWrites links driver and removes pool row', () => {
    const payload = { id: 'P1', estado: 'EN_CURSO' };
    const writes = buildAcceptSyncWrites('P1', 'D1', payload);
    expect(writes['pedidos/P1']).toEqual(payload);
    expect(writes['repartidores/D1/pedido_activo']).toBe('P1');
    expect(writes['pedidos_para_reparto/P1']).toBeNull();
    expect(writes['pedidos_en_camino/P1']).toEqual(payload);
  });

  test('buildTransitionSyncWrites updates active order view', () => {
    const order = { id: 'P1', estado: 'EN_CURSO' };
    const writes = buildTransitionSyncWrites('P1', 'LLEGUE_A_CLIENTE', order);
    expect(writes['pedidos/P1/estado']).toBe('LLEGUE_A_CLIENTE');
    expect(writes['pedidos_en_camino/P1'].estado).toBe('LLEGUE_A_CLIENTE');
  });

  test('buildLocationSyncWrites keeps state advancement optional', () => {
    const { updates, ubicacion } = buildLocationSyncWrites({
      uid: 'D1',
      pedidoId: 'P1',
      lat: 16.7,
      lng: -93.1,
      timestamp: 123,
      fasePanel: 'Ruta',
      currentOrder: { estado_pedido: 'LISTO' },
      stateHint: 'EN_CURSO'
    });
    expect(ubicacion).toEqual({ lat: 16.7, lng: -93.1, timestamp: 123, pedidoId: 'P1' });
    expect(updates['pedidos/P1/estado']).toBe('EN_CURSO');
    expect(updates['pedidos/P1/fase_panel']).toBe('Ruta');
  });

  test('buildDriverOfflineSyncWrites and buildDriverOnlineSyncWrites control presence flags', () => {
    const offline = buildDriverOfflineSyncWrites('D1', 100);
    const online = buildDriverOnlineSyncWrites('D1', null, 200);
    expect(offline['repartidores/D1/estado']).toBe('OFFLINE');
    expect(online['repartidores/D1/disponible']).toBe(true);
    expect(online['repartidores/D1/pedido_activo']).toBeNull();
  });

  test('buildCompleteSyncWrites clears active references', () => {
    const writes = buildCompleteSyncWrites('P1', { estado: 'EN_CURSO' }, 'D1', { estado: 'ENTREGADO' });
    expect(writes['pedidos/P1'].estado).toBe('ENTREGADO');
    expect(writes['pedidos_en_camino/P1']).toBeNull();
    expect(writes['repartidores/D1/pedido_activo']).toBeNull();
  });
});
