import { jest } from '@jest/globals';
import request from 'supertest';

const mockVerifyIdToken = jest.fn(async () => ({
  uid: 'admin-uid',
  email: 'admin@nellydelivery.com'
}));

const mockSet = jest.fn(async (payload) => payload);
const mockOnce = jest.fn(async () => ({ val: () => null }));
const mockRef = jest.fn(() => ({
  set: mockSet,
  once: mockOnce
}));

const mockAdmin = {
  auth: () => ({ verifyIdToken: mockVerifyIdToken }),
  database: () => ({ ref: mockRef })
};

jest.unstable_mockModule('../config/firebase-admin-esm.js', () => ({
  getAdmin: jest.fn(async () => mockAdmin)
}));

const { default: app } = await import('../app.js');

describe('Admin order creation contract', () => {
  beforeEach(() => {
    mockVerifyIdToken.mockClear();
    mockSet.mockClear();
    mockOnce.mockClear();
    mockRef.mockClear();
  });

  it('crea un pedido compatible con cocina y reparto', async () => {
    const res = await request(app)
      .post('/api/admin/pedidos')
      .set('Authorization', 'Bearer dummy-token')
      .send({
        cliente_nombre: 'Ana',
        telefono: '5551234567',
        direccion: 'Calle 1',
        descripcion: 'Pizza',
        items: [
          { nombre: 'Pizza', cantidad: 2, precio: 120 },
          { nombre: 'Refresco', cantidad: 1, precio: 30 }
        ],
        subtotal: 270,
        costo_envio: 20,
        propina: 10,
        total: 300,
        pago: {
          metodo: 'efectivo',
          estado: 'pendiente'
        }
      });

    expect(res.statusCode).toBe(201);
    expect(mockSet).toHaveBeenCalledTimes(1);

    const savedPayload = mockSet.mock.calls[0][0];
    expect(savedPayload).toMatchObject({
      id: expect.any(String),
      cliente_nombre: 'Ana',
      cliente: 'Ana',
      subtotal: 270,
      costo_envio: 20,
      propina: 10,
      total: 300,
      monto_total: 300,
      pago: {
        metodo: 'efectivo',
        estado: 'pendiente'
      },
      estado: 'pendiente',
      estado_pedido: 'PENDIENTE',
      fase_panel: 'Pendiente',
      repartidor_id: null,
      conductorId: null,
      pedido_activo: null,
      logistica: {
        estado: 'pendiente',
        repartidor_id: null
      }
    });
  });
});
