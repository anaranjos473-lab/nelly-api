import { jest } from '@jest/globals';
import request from 'supertest';

process.env.SOPORTE_TOKEN = 'test_soporte_token';

// MOCK ESM PURO con datos inteligentes
jest.unstable_mockModule('firebase-admin', () => {
  let mockFn = async () => ({ val: () => null }); // Por defecto null
  return {
    default: {
      initializeApp: jest.fn(),
      apps: { length: 1 },
      database: () => ({
        ref: (path) => ({
          once: async (event) => await mockFn(path)
        })
      }),
      __setMockOnce: (fn) => { mockFn = fn; },
      firestore: () => ({
        collection: jest.fn(() => ({
          add: jest.fn(async (data) => {
            return { id: 'id_simulado_123', ...data };
          }),
          doc: jest.fn(() => ({
            set: jest.fn(async (data) => {
              return { id: 'id_simulado_123', ...data };
            }),
            get: jest.fn(async () => ({
              exists: false,
              id: 'id_simulado_123',
              data: () => ({
                name: 'Alberto',
                email: 'alberto@test.com',
                password: 'hashed_password',
                total: 250
              })
            }))
          })),
          where: jest.fn(() => ({
            onSnapshot: (cb) => {
              cb({ docChanges: () => [], size: 0 });
              return () => {};
            },
            get: async () => ({ empty: true, docs: [] })
          }))
        }))
      })
    }
  };
});

const admin = (await import('firebase-admin')).default;
const { default: app } = await import('../app.js');

describe('POST /soporte/verificar-token', () => {

  // Tus variables de prueba
  const validToken = "F7hujhMmTRiTBBW4AqT6hA:APA91bE4Bh2AfYdkfaTrvWJphhDXvAYMTFk75dVCQxyskqGJRcxu2PnSPhZSg-NddtlItGft_TxPuLzjOZWG4Zs1Gn9JRAuB_yXFpwkyPC9OpdofziIlABQ";
  const invalidToken = "token_invalido_corto";

  beforeEach(() => {
    admin.__setMockOnce(async (path) => {
      const ruta = String(path || '');
      if (ruta.includes('driver_valido')) return { val: () => validToken };
      if (ruta.includes('driver_invalido')) return { val: () => invalidToken };
      return { val: () => null };
    });
  });

    const ACCESS_TOKEN = process.env.SOPORTE_TOKEN;

    it('debe rechazar si no hay idConductor', async () => {
        const res = await request(app)
            .post('/soporte/verificar-token')
            .send({ token: ACCESS_TOKEN });
        expect(res.text).toMatch(/Intentar de nuevo/);
    });

    it('debe responder con advertencia si el token no existe', async () => {
        admin.__setMockOnce(async () => ({ val: () => null }));
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'no_existe_123', token: ACCESS_TOKEN });
        expect(res.text).toMatch(/No se encontró token/);
    });

    it('debe mostrar el token si es válido', async () => {
        // Token FCM válido (longitud y caracteres correctos)
        const validToken = 'dQw4w9WgXcQ-abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_:'.repeat(2).slice(0,152);
        admin.__setMockOnce(async () => ({ val: () => validToken }));
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'driver_valido', token: ACCESS_TOKEN });
        expect(res.text).toMatch(/Token FCM para driver_valido/);
        expect(res.text).toContain(validToken);
    });

    it('debe advertir si el token tiene formato inválido', async () => {
        // Token corto y con caracteres inválidos
        const invalidToken = '###INVALIDO###';
        admin.__setMockOnce(async () => ({ val: () => invalidToken }));
        const res = await request(app)
            .post('/soporte/verificar-token')
            .type('form')
            .send({ idConductor: 'driver_invalido', token: ACCESS_TOKEN });
        expect(res.text).toMatch(/formato inválido/);
        expect(res.text).toContain(invalidToken);
    });
});
