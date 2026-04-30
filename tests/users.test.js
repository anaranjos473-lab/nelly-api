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
          add: jest.fn(async (data) => {
            if (data && data.email === 'no-es-email') throw new Error('Email inválido');
            return { id: 'id_simulado_123', ...data };
          }),
          doc: jest.fn(() => ({
            set: jest.fn(async (data) => {
              if (data && data.email === 'no-es-email') throw new Error('Email inválido');
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
          }))
        }))
      })
    }
  };
});

const admin = (await import('firebase-admin')).default;
const { default: app } = await import('../app.js');

describe('Usuarios API', () => {
  it('Debe crear un usuario válido', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ name: 'Alberto', email: 'alberto@test.com', password: '123456' });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe('alberto@test.com');
  });

  it('Debe rechazar usuario sin email válido', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ name: 'Alberto', email: 'no-es-email', password: '123456' });

    expect(res.statusCode).toBe(400);
    expect(res.body.errors[0].msg).toBe('Debe ser un email válido');
  });
});
