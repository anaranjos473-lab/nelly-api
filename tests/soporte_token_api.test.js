// tests/soporte_token_api.test.js
// Prueba automática del endpoint de consulta de token FCM

const request = require('supertest');
const express = require('express');


// Mock dinámico para simular distintos escenarios de token
const mockOnce = jest.fn();
jest.mock('firebase-admin', () => {
    return {
        database: () => ({
            ref: () => ({
                once: mockOnce
            })
        })
    };
});

const soporteRoutes = require('../routes/soporte');

const app = express();
app.use(express.urlencoded({ extended: true }));
app.use('/soporte', soporteRoutes);

describe('POST /soporte/verificar-token', () => {
    beforeEach(() => {
        mockOnce.mockReset();
    });

    it('debe rechazar si no hay idConductor', async () => {
        const res = await request(app)
            .post('/soporte/verificar-token')
            .send({});
        expect(res.text).toMatch(/Intentar de nuevo/);
    });

    it('debe responder con advertencia si el token no existe', async () => {
        mockOnce.mockResolvedValue({ val: () => null });
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'no_existe_123' });
        expect(res.text).toMatch(/No se encontró token/);
    });

    it('debe mostrar el token si es válido', async () => {
        // Token FCM válido (longitud y caracteres correctos)
        const validToken = 'dQw4w9WgXcQ-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_:'.repeat(2).slice(0,152);
        mockOnce.mockResolvedValue({ val: () => validToken });
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'driver_valido' });
        expect(res.text).toMatch(/Token FCM para driver_valido/);
        expect(res.text).toContain(validToken);
    });

    it('debe advertir si el token tiene formato inválido', async () => {
        // Token corto y con caracteres inválidos
        const invalidToken = '###INVALIDO###';
        mockOnce.mockResolvedValue({ val: () => invalidToken });
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'driver_invalido' });
        expect(res.text).toMatch(/formato inválido/);
        expect(res.text).toContain(invalidToken);
    });
});
