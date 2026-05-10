// tests/antifraude.test.js
import { auditarEntrega } from '../src/agentes/agenteAntifraude.js';

describe('auditarEntrega', () => {
  it('detecta entrega legítima (distancia < 0.5km)', async () => {
    const pedido = {
      estado: 'ENTREGADO',
      conductorId: 'C1',
      latCliente: 16.752,
      lngCliente: -93.125
    };
    const datosConductor = { lat: 16.7521, lng: -93.1251 };
    const pedidoId = 'PEDIDO_OK';
    const res = await auditarEntrega({ pedido, datosConductor, pedidoId });
    expect(res.alerta).toBe('ok');
    expect(res.distancia).toBeLessThan(0.5);
  });

  it('detecta fraude (distancia > 0.5km)', async () => {
    const pedido = {
      estado: 'ENTREGADO',
      conductorId: 'C2',
      latCliente: 16.752,
      lngCliente: -93.125
    };
    const datosConductor = { lat: 16.760, lng: -93.130 };
    const pedidoId = 'PEDIDO_FRAUDE';
    const res = await auditarEntrega({ pedido, datosConductor, pedidoId });
    expect(res.alerta).toBe('fraude');
    expect(res.distancia).toBeGreaterThan(0.5);
  });

  it('alerta por GPS faltante', async () => {
    const pedido = {
      estado: 'ENTREGADO',
      conductorId: 'C3',
      latCliente: 16.752,
      lngCliente: -93.125
    };
    const datosConductor = { lat: null, lng: null };
    const pedidoId = 'PEDIDO_GPS';
    const res = await auditarEntrega({ pedido, datosConductor, pedidoId });
    expect(res.alerta).toBe('gps_faltante');
  });

  it('alerta por destino faltante', async () => {
    const pedido = {
      estado: 'ENTREGADO',
      conductorId: 'C4'
      // sin latCliente/lngCliente
    };
    const datosConductor = { lat: 16.752, lng: -93.125 };
    const pedidoId = 'PEDIDO_DESTINO';
    const res = await auditarEntrega({ pedido, datosConductor, pedidoId });
    expect(res.alerta).toBe('destino_faltante');
  });
});
