import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { registrarPagoDeudaTx } from '../src/services/debtLockService.js';

const router = express.Router();

async function requirePanelUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    const admin = await getAdmin();
    const decoded = await admin.auth().verifyIdToken(token);
    if (process.env.NODE_ENV === 'production' && !decoded.admin) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    req.firebaseUser = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

router.post('/finanzas/registrar-pago-deuda', requirePanelUser, async (req, res, next) => {
  try {
    const { uid, monto_pago: montoPago } = req.body;
    const admin = await getAdmin();
    const result = await registrarPagoDeudaTx(admin.database(), {
      uid,
      montoPago,
      origen: 'panel'
    });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
});

export default router;
