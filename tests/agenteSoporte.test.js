import { identificarPedidosRetrasados } from '../src/agentes/agenteSoporte.js';

describe('identificarPedidosRetrasados', () => {
  it('detecta pedidos retrasados en mayúsculas y minúsculas', () => {
    const ahora = 1_700_000_000_000;
    const pedidos = {
      a1: {
        estado: 'PENDIENTE',
        timestampCreacion: ahora - (16 * 60 * 1000),
        intervencionSoporte: false
      },
      a2: {
        estado: 'pendiente',
        timestampCreacion: ahora - (20 * 60 * 1000)
      },
      a3: {
        estado: 'pendiente',
        timestampCreacion: ahora - (5 * 60 * 1000)
      },
      a4: {
        estado: 'PENDIENTE',
        timestampCreacion: ahora - (30 * 60 * 1000),
        intervencionSoporte: true
      }
    };

    const retrasados = identificarPedidosRetrasados(pedidos, ahora);

    expect(retrasados).toEqual([
      ['a1', pedidos.a1],
      ['a2', pedidos.a2]
    ]);
  });
});
