import { calcularDistancia, encontrarMejorConductor } from '../src/agentes/workerDistancias.js';

describe('workerDistancias', () => {
  test('calcula distancia y selecciona el conductor disponible mas cercano', () => {
    const distancia = calcularDistancia(16.75, -93.12, 16.751, -93.121);
    expect(distancia).toBeGreaterThan(0);

    const mejor = encontrarMejorConductor(
      { lat: 16.75, lng: -93.12 },
      {
        a: { estado: 'DISPONIBLE', lat: 16.751, lng: -93.121 },
        b: { estado: 'DISPONIBLE', lat: 16.8, lng: -93.2 },
        c: { estado: 'OCUPADO', lat: 16.75, lng: -93.12 }
      }
    );

    expect(mejor).toEqual(expect.objectContaining({ id: 'a' }));
  });
});
