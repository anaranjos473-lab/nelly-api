import { jest } from '@jest/globals';
import request from 'supertest';
import jwt from 'jsonwebtoken';

process.env.JWT_SECRET = 'test-orders-secret';

jest.unstable_mockModule('firebase-admin', () => {
  const mockFn = jest.fn(async (path) => {
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
        ref: () => ({
          once: mockFn,
          get: mockFn,
          push: jest.fn(() => ({
            key: 'orden_simulada_456',
            set: jest.fn(async (data) => data)
          }))
        })
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

const { default: app } = await import('../app.js');
const authToken = jwt.sign({ id: 'tester', email: 'tester@nelly.test' }, process.env.JWT_SECRET, { expiresIn: '1h' });

describe('Ordenes API', () => {
  it('Debe crear una orden valida', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: '123', items: [{ producto: 'Pizza', cantidad: 2 }], total: 250 });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.total).toBe(250);
  });

  it('Debe rechazar orden sin items', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ userId: '123', items: [], total: 250 });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Debe incluir al menos un producto');
  });

  it('Debe rechazar orden sin token', async () => {
    const res = await request(app)
      .post('/api/ordenes')
      .send({ userId: '123', items: [{ producto: 'Pizza', cantidad: 2 }], total: 250 });

    expect(res.statusCode).toBe(401);
  });
});
