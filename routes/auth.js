import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';

const router = express.Router();

function bootstrapAllowed(req) {
  if (process.env.NODE_ENV !== 'production') {
    return true;
  }

  const expected = process.env.AUTH_BOOTSTRAP_TOKEN;
  
  // Si no existe token de bootstrap configurado, permitir (CORS ya validó origen)
  if (!expected) {
    return true;
  }

  // Si existe token, validar que coincida
  const received = req.query.token || req.headers['x-auth-bootstrap-token'];
  return received === expected;
}

async function createToken(uid, claims = {}) {
  const admin = await getAdmin();
  return admin.auth().createCustomToken(uid, claims);
}

router.get('/driver-token', async (req, res, next) => {
  try {
    if (!bootstrapAllowed(req)) {
      return res.status(403).json({ ok: false, error: 'Bootstrap de auth no autorizado' });
    }

    const uid = String(req.query.uid || '').trim();
    if (!uid) {
      return res.status(400).json({ ok: false, error: 'uid es requerido' });
    }

    const token = await createToken(uid, { driver: true, role: 'repartidor' });
    return res.json({ ok: true, token });
  } catch (error) {
    return next(error);
  }
});

router.get('/panel-token', async (req, res, next) => {
  try {
    if (!bootstrapAllowed(req)) {
      return res.status(403).json({ ok: false, error: 'Bootstrap de auth no autorizado' });
    }

    const uid = String(req.query.uid || process.env.PANEL_BOOTSTRAP_UID || 'panel-admin').trim();
    const token = await createToken(uid, { admin: true, panel: true, role: 'panel_cocina' });
    return res.json({ ok: true, token });
  } catch (error) {
    return next(error);
  }
});

export default router;
