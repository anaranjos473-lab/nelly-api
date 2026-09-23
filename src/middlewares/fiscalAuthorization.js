import {
  hasFiscalPermission,
  createFiscalAuthorizationAudit
} from '../services/fiscalAuthorizationService.js';

function requireFiscalPermission(permission, { action = 'READ', resource = 'fiscal' } = {}) {
  return (req, res, next) => {
    const user = req.firebaseUser || {};
    const allowed = hasFiscalPermission(user, permission);
    req.fiscalAuthorization = createFiscalAuthorizationAudit({
      user,
      permission,
      action,
      resource,
      decision: allowed ? 'ALLOWED' : 'DENIED'
    });
    if (!allowed) {
      return res.status(403).json({ ok: false, error: 'Permisos fiscales insuficientes' });
    }
    return next();
  };
}

export { requireFiscalPermission };
