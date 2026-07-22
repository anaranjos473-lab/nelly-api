import { buildIdentityProjection, normalizeIdentityAccount } from '../src/integrations/index.js';

describe('identityAdapter', () => {
  test('normaliza una cuenta de identidad', () => {
    const account = normalizeIdentityAccount({ id: 'ID-1', provider: 'Firebase', email: 'USER@EXAMPLE.COM', active: true });
    expect(account.provider).toBe('firebase');
    expect(account.email).toBe('user@example.com');
  });

  test('construye una proyeccion de identidad valida', () => {
    const projection = buildIdentityProjection([
      { id: 'ID-1', provider: 'Firebase', email: 'USER@EXAMPLE.COM', active: true },
      { id: 'ID-2', provider: 'OAuth', email: 'user2@example.com', active: false }
    ]);
    expect(projection.ok).toBe(true);
    expect(projection.summary.total).toBe(2);
    expect(projection.summary.active).toBe(1);
  });
});
