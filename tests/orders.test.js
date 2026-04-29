import request from 'supertest';
import app from '../src/app.js';

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
