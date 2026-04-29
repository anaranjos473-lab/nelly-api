import request from 'supertest';
import app from '../app.js';

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
