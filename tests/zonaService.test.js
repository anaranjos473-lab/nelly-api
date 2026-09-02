import { describe, expect, test } from '@jest/globals';
import { validateZonaV1 } from '../src/services/zonaService.js';

const valid = {
    id: 'zona_centro',
    nombre: 'Centro',
    colorHex: '#1976D2',
    coordenadas: [
        { lat: 16.7521, lng: -93.1162 },
        { lat: 16.7548, lng: -93.1101 },
        { lat: 16.7489, lng: -93.1074 },
        { lat: 16.7462, lng: -93.1149 }
    ]
};

describe('Zona v1 validation', () => {
    test('acepta y normaliza una zona valida', () => {
        expect(validateZonaV1(valid)).toMatchObject({ id: 'zona_centro', colorHex: '#1976D2' });
    });
    test.each([
        ['id faltante', { ...valid, id: '' }],
        ['id no normalizado', { ...valid, id: 'Zona Centro' }],
        ['color invalido', { ...valid, colorHex: 'blue' }],
        ['menos de tres vertices', { ...valid, coordenadas: valid.coordenadas.slice(0, 2) }],
        ['coordenada fuera de rango', { ...valid, coordenadas: [{ lat: 91, lng: 0 }, ...valid.coordenadas.slice(1)] }],
        ['coordenada no finita', { ...valid, coordenadas: [{ lat: Number.NaN, lng: 0 }, ...valid.coordenadas.slice(1)] }],
        ['vertice duplicado', { ...valid, coordenadas: [valid.coordenadas[0], valid.coordenadas[0], ...valid.coordenadas.slice(2)] }],
        ['campo desconocido', { ...valid, activa: true }]
    ])('%s', (_, payload) => expect(() => validateZonaV1(payload)).toThrow());
    test('rechaza autointersecciones', () => {
        expect(() => validateZonaV1({ ...valid, coordenadas: [
            { lat: 0, lng: 0 }, { lat: 1, lng: 1 }, { lat: 0, lng: 1 }, { lat: 1, lng: 0 }
        ] })).toThrow();
    });
    test('PUT no permite cambiar identidad', () => {
        expect(() => validateZonaV1({ ...valid, id: 'otra_zona' }, { expectedId: valid.id })).toThrow();
    });
});
