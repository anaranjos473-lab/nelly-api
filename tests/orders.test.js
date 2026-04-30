import { jest } from '@jest/globals';
import request from 'supertest';

// MOCK ESM PURO con datos inteligentes
jest.unstable_mockModule('firebase-admin', () => {
  const mockFn = jest.fn(async (path) => {
    // Soporte: simula RTDB
    if (path && path.includes('driver_valido')) {
      return { val: () => 'token_valido_1234567890' };
    }
    if (path && path.includes('driver_invalido')) {
      return { val: () => '###INVALIDO###' };
    }
    return { val: () => null };
  });
  return {
    default: {
      initializeApp: jest.fn(),
      apps: { length: 1 },
      database: () => ({
        ref: () => ({ once: mockFn })
      }),
      __setMockOnce: (fn) => { mockFn.mockImplementationOnce(fn); },
      firestore: () => ({
        collection: jest.fn(() => ({
          add: jest.fn(async (data) => ({ id: 'orden_simulada_456', ...data })),
          doc: jest.fn(() => ({
            set: jest.fn(async (data) => ({ id: 'orden_simulada_456', ...data })),
            get: jest.fn(async () => ({
              exists: true,
              id: 'orden_simulada_456',
              data: () => ({
                userId: '123',
                items: [{ producto: 'Pizza', cantidad: 2 }],
                total: 250
              })
            }))
          }))
        }))
      })
    }
  };
});

const admin = (await import('firebase-admin')).default;
const { default: app } = await import('../app.js');

describe('Órdenes API', () => {
  it('Debe crear una orden válida', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', 'Bearer tokenDePrueba') // reemplaza con un JWT válido
      .send({ userId: '123', items: [{ producto: 'Pizza', cantidad: 2 }], total: 250 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.total).toBe(250);
  });

  it('Debe rechazar orden sin items', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', 'Bearer tokenDePrueba')
      .send({ userId: '123', items: [], total: 250 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Debe incluir al menos un producto');
  });
});
