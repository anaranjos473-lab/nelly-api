import { describe, expect, it, jest } from '@jest/globals';
import {
  createFiscalAuthorizationAudit,
  hasFiscalPermission,
  resolveFiscalPermissions
} from '../src/services/fiscalAuthorizationService.js';
import { requireFiscalPermission } from '../src/middlewares/fiscalAuthorization.js';

function runMiddleware(permission, user, options = {}) {
  const req = { firebaseUser: user };
  const res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  const next = jest.fn();
  requireFiscalPermission(permission, options)(req, res, next);
  return { req, res, next };
}

describe('NELLY-FISCAL RBAC', () => {
  it('resuelve permisos explícitos desde claims', () => {
    expect(resolveFiscalPermissions({ claims: { fiscal_permissions: ['FISCAL_VIEW', 'FISCAL_ANALYZE'] } }).permissions)
      .toEqual(['FISCAL_VIEW', 'FISCAL_ANALYZE']);
  });

  it('asigna permisos operativos al rol administrador sin asignar certify', () => {
    const permissions = resolveFiscalPermissions({ role: 'administrador_general' }).permissions;
    expect(permissions).toEqual(expect.arrayContaining(['FISCAL_VIEW', 'FISCAL_ANALYZE', 'FISCAL_ADMIN', 'FISCAL_EXPORT']));
    expect(permissions).not.toContain('FISCAL_CERTIFY');
  });

  it('asigna view y analyze al analista', () => {
    expect(resolveFiscalPermissions({ role: 'analista' }).permissions)
      .toEqual(['FISCAL_VIEW', 'FISCAL_ANALYZE']);
  });

  it('rechaza una capacidad desconocida', () => {
    expect(hasFiscalPermission({ permissions: ['FISCAL_VIEW'] }, 'UNKNOWN')).toBe(false);
  });

  it('sin token fiscal no permite view', () => {
    const result = runMiddleware('FISCAL_VIEW', {});
    expect(result.res.status).toHaveBeenCalledWith(403);
    expect(result.next).not.toHaveBeenCalled();
    expect(result.req.fiscalAuthorization.decision).toBe('DENIED');
  });

  it('panel sin FISCAL_VIEW no permite analizar', () => {
    const result = runMiddleware('FISCAL_ANALYZE', { panel: true });
    expect(result.res.status).toHaveBeenCalledWith(403);
  });

  it('view puede consultar', () => {
    const result = runMiddleware('FISCAL_VIEW', { uid: 'viewer-1', fiscal_permissions: ['FISCAL_VIEW'] });
    expect(result.next).toHaveBeenCalled();
    expect(result.req.fiscalAuthorization.decision).toBe('ALLOWED');
  });

  it('view no puede analyze, admin ni export', () => {
    const user = { fiscal_permissions: ['FISCAL_VIEW'] };
    expect(runMiddleware('FISCAL_ANALYZE', user).res.status).toHaveBeenCalledWith(403);
    expect(runMiddleware('FISCAL_ADMIN', user).res.status).toHaveBeenCalledWith(403);
    expect(runMiddleware('FISCAL_EXPORT', user).res.status).toHaveBeenCalledWith(403);
  });

  it('analyze no puede certify', () => {
    const result = runMiddleware('FISCAL_CERTIFY', { fiscal_permissions: ['FISCAL_ANALYZE'] });
    expect(result.res.status).toHaveBeenCalledWith(403);
  });

  it('certify solo funciona con claim explícito y registra actor', () => {
    const result = runMiddleware('FISCAL_CERTIFY', {
      uid: 'fiscal-1', email: 'fiscal@example.test', fiscal_permissions: ['FISCAL_CERTIFY']
    }, { action: 'CERTIFY_CASE', resource: 'FISCAL_CASE:1' });
    expect(result.next).toHaveBeenCalled();
    expect(result.req.fiscalAuthorization).toMatchObject({
      actor_id: 'fiscal-1',
      permission: 'FISCAL_CERTIFY',
      action: 'CERTIFY_CASE',
      resource: 'FISCAL_CASE:1',
      decision: 'ALLOWED'
    });
  });

  it('la auditoría conserva evidencia de roles y permisos', () => {
    const audit = createFiscalAuthorizationAudit({
      user: { uid: 'admin-1', role: 'admin' },
      permission: 'FISCAL_ADMIN', action: 'MANAGE_RULE', resource: 'rule-1', decision: 'ALLOWED', timestamp: 123
    });
    expect(audit).toMatchObject({ event_type: 'FISCAL_AUTHORIZATION_DECISION', actor_id: 'admin-1', timestamp: 123 });
    expect(audit.evidence.permissions).toContain('FISCAL_ADMIN');
  });
});
