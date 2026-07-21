import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';

const router = express.Router();

function logAuthEvent(parts) {
  const payload = Object.entries(parts)
    .filter(([, value]) => value !== undefined && value !== null && String(value).trim() !== '')
    .map(([key, value]) => `${key}=${String(value)}`)
    .join(' ');

  console.log(`[AUTH][panel-token] ${payload}`);
}

function getBearerToken(req) {
  const authHeader = String(req.headers.authorization || '').trim();
  const match = authHeader.match(/^Bearer\s+(.+)$/i);

  if (!match) {
    return { present: false, token: null };
  }

  const token = match[1].trim();
  return { present: true, token: token || null };
}

async function verifyBearerIdentityToken(req) {
  const { present, token } = getBearerToken(req);

  if (!present) {
    return { present: false, decoded: null };
  }

  if (!token) {
    return { present: true, decoded: null, error: 'Authorization Bearer vacío' };
  }

  const admin = await getAdmin();
  const decoded = await admin.auth().verifyIdToken(token);
  return { present: true, decoded };
}

function bootstrapAllowed(req) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const expected = process.env.AUTH_BOOTSTRAP_TOKEN;
  if (!expected) {
    return true;
  }

  const received = req.query.token || req.headers['x-auth-bootstrap-token'];
  return received === expected;
}

async function createToken(uid, claims = {}) {
  const admin = await getAdmin();
  return admin.auth().createCustomToken(uid, claims);
}

function hasPanelClaims(decoded) {
  return Boolean(decoded?.admin || decoded?.panel || decoded?.role === 'panel_cocina');
}

function resolvePanelUid(decoded, fallbackUid) {
  const claimedUid = String(decoded?.uid || '').trim();
  return claimedUid || fallbackUid;
}

router.get('/driver-token', async (req, res, next) => {
  try {
    if (!bootstrapAllowed(req)) {
      logAuthEvent({ auth_method: 'bootstrap', auth_result: 'unauthorized' });
      return res.status(401).json({ ok: false, error: 'Bootstrap de auth no autorizado' });
    }

    const uid = String(req.query.uid || '').trim();
    if (!uid) {
      return res.status(400).json({ ok: false, error: 'uid es requerido' });
    }

    const token = await createToken(uid, { driver: true, role: 'repartidor' });
    logAuthEvent({ auth_method: 'bootstrap', auth_result: 'success', uid });
    return res.json({ ok: true, token, authMode: 'bootstrap' });
  } catch (error) {
    return next(error);
  }
});

router.get('/panel-token', async (req, res, next) => {
  try {
    const bearer = await verifyBearerIdentityToken(req).catch((error) => ({
      present: true,
      decoded: null,
      error: error?.message || 'Bearer inválido'
    }));

    if (bearer.present) {
      if (bearer.error) {
        logAuthEvent({
          auth_method: 'firebase',
          auth_result: 'unauthorized',
          reason: 'invalid_or_expired_token'
        });
        return res.status(401).json({ ok: false, error: 'Token de Firebase inválido o expirado' });
      }

      const decoded = bearer.decoded;
      const uid = resolvePanelUid(decoded, process.env.PANEL_BOOTSTRAP_UID || 'panel-admin');

      if (!hasPanelClaims(decoded)) {
        logAuthEvent({
          auth_method: 'firebase',
          auth_result: 'forbidden',
          uid,
          reason: 'missing_panel_claim'
        });
        return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
      }

      const token = await createToken(uid, { admin: true, panel: true, role: 'panel_cocina' });
      logAuthEvent({ auth_method: 'firebase', auth_result: 'success', uid });
      return res.json({ ok: true, token, authMode: 'firebase' });
    }

    if (!bootstrapAllowed(req)) {
      logAuthEvent({ auth_method: 'bootstrap', auth_result: 'unauthorized' });
      return res.status(401).json({ ok: false, error: 'Bootstrap de auth no autorizado' });
    }

    const uid = String(req.query.uid || process.env.PANEL_BOOTSTRAP_UID || 'panel-admin').trim();
    const token = await createToken(uid, { admin: true, panel: true, role: 'panel_cocina' });
    logAuthEvent({ auth_method: 'bootstrap', auth_result: 'success', uid });
    return res.json({ ok: true, token, authMode: 'bootstrap' });
  } catch (error) {
    return next(error);
  }
});

export default router;
