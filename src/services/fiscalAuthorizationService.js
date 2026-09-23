const FISCAL_PERMISSIONS = Object.freeze([
  'FISCAL_VIEW',
  'FISCAL_ANALYZE',
  'FISCAL_CERTIFY',
  'FISCAL_ADMIN',
  'FISCAL_EXPORT'
]);

const ROLE_PERMISSIONS = Object.freeze({
  ADMIN: ['FISCAL_VIEW', 'FISCAL_ANALYZE', 'FISCAL_ADMIN', 'FISCAL_EXPORT'],
  ADMINISTRADOR_GENERAL: ['FISCAL_VIEW', 'FISCAL_ANALYZE', 'FISCAL_ADMIN', 'FISCAL_EXPORT'],
  ANALISTA: ['FISCAL_VIEW', 'FISCAL_ANALYZE'],
  FISCALISTA_AUTORIZADO: ['FISCAL_VIEW', 'FISCAL_ANALYZE']
});

function asList(value) {
  if (Array.isArray(value)) return value;
  if (typeof value === 'string') return value.split(/[\s,]+/);
  return [];
}

function normalizePermission(value) {
  return String(value || '').trim().toUpperCase().replace(/[-\s]+/g, '_');
}

function resolveFiscalPermissions(user = {}) {
  const claims = user.claims || {};
  const explicit = [
    ...asList(user.fiscal_permissions),
    ...asList(claims.fiscal_permissions),
    ...asList(user.permissions),
    ...asList(claims.permissions)
  ].map(normalizePermission);
  const roles = [
    ...asList(user.role),
    ...asList(user.roles),
    ...asList(claims.role),
    ...asList(claims.roles)
  ].map(normalizePermission);
  const rolePermissions = roles.flatMap((role) => ROLE_PERMISSIONS[role] || []);
  const permissions = [...new Set([...explicit, ...rolePermissions])]
    .filter((permission) => FISCAL_PERMISSIONS.includes(permission));
  return { permissions, roles };
}

function hasFiscalPermission(user, requiredPermission) {
  const required = normalizePermission(requiredPermission);
  if (!FISCAL_PERMISSIONS.includes(required)) return false;
  return resolveFiscalPermissions(user).permissions.includes(required);
}

function createFiscalAuthorizationAudit({ user = {}, permission, action, resource, decision, timestamp = Date.now() } = {}) {
  return {
    event_type: 'FISCAL_AUTHORIZATION_DECISION',
    actor_id: user.uid || user.user_id || null,
    actor_email: user.email || null,
    permission: normalizePermission(permission),
    action: String(action || '').trim() || null,
    resource: String(resource || '').trim() || null,
    decision: String(decision || '').trim().toUpperCase() || null,
    timestamp,
    evidence: {
      roles: resolveFiscalPermissions(user).roles,
      permissions: resolveFiscalPermissions(user).permissions
    }
  };
}

export {
  FISCAL_PERMISSIONS,
  ROLE_PERMISSIONS,
  resolveFiscalPermissions,
  hasFiscalPermission,
  createFiscalAuthorizationAudit
};
