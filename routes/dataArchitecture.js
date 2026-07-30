import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import {
  buildDataArchitectureSnapshot,
  DATA_ARCHITECTURE_MODE,
  TARGET_ARCHITECTURE
} from '../src/services/dataArchitectureService.js';
import { buildArchiveEngineSnapshot } from '../src/services/archiveEngine.js';

const router = express.Router();

const PANEL_ADMIN_EMAILS = new Set(
  String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasDataArchitectureAccess(decoded = {}) {
  const email = String(decoded.email || decoded.sub || decoded.user_id || '').trim().toLowerCase();
  return Boolean(
    decoded.admin
    || decoded.panel
    || decoded?.claims?.admin
    || decoded?.claims?.panel
    || PANEL_ADMIN_EMAILS.has(email)
  );
}

async function requireDataArchitectureAccess(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    const admin = await getAdmin();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
      decoded = decodeJwtPayload(token);
      if (!decoded) throw error;
    }

    if (!hasDataArchitectureAccess(decoded)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }

    req.firebaseUser = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

router.get('/', (_req, res) => {
  res.json({
    ok: true,
    module: 'data-architecture',
    mode: DATA_ARCHITECTURE_MODE,
    target: TARGET_ARCHITECTURE
  });
});

router.get('/status', requireDataArchitectureAccess, async (_req, res, next) => {
  try {
    const admin = await getAdmin();
    const snapshot = await buildDataArchitectureSnapshot(admin);
    return res.json(snapshot);
  } catch (error) {
    return next(error);
  }
});

router.get('/archive', requireDataArchitectureAccess, async (_req, res, next) => {
  try {
    const admin = await getAdmin();
    const snapshot = await admin.database().ref('pedidos').once('value');
    const pedidos = snapshot.val() || {};
    const orders = Object.entries(pedidos).map(([id, pedido]) => ({ id, ...pedido }));
    return res.json(buildArchiveEngineSnapshot(orders));
  } catch (error) {
    return next(error);
  }
});

export default router;
