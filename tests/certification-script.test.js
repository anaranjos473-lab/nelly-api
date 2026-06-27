import { buildCertificationReport, resolveAuthConfig } from '../scripts/ciclo-operativo-repetible.js';

describe('certification script helpers', () => {
  it('prefers an existing id token when provided', () => {
    const config = resolveAuthConfig({ FIREBASE_ID_TOKEN: 'abc123' });
    expect(config).toEqual({ mode: 'id-token', token: 'abc123' });
  });

  it('uses the development auth token when available', () => {
    const config = resolveAuthConfig({ DEV_AUTH_TOKEN: 'dev-token', DEV_AUTH_UID: 'dev-driver' });
    expect(config).toEqual({ mode: 'dev-auth', token: 'dev-token', uid: 'dev-driver' });
  });

  it('marks the report as PASS when all steps succeed', () => {
    const report = buildCertificationReport({
      pedidoId: 'PEDIDO_TEST',
      steps: [
        { name: 'dispatch', ok: true, status: 'OK' },
        { name: 'accept', ok: true, status: 'OK' },
        { name: 'complete', ok: true, status: 'OK' }
      ],
      startedAt: 1710000000000,
      completedAt: 1710000001000
    });

    expect(report.status).toBe('PASS');
    expect(report.summary.ok).toBe(true);
    expect(report.summary.failedSteps).toHaveLength(0);
  });
});
