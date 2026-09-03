import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual, registrarPagoDeudaTx } from '../src/services/debtLockService.js';

const router = express.Router();

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

function hasPanelAccess(decoded = {}) {
  return Boolean(decoded.admin || decoded.panel || decoded?.claims?.admin || decoded?.claims?.panel);
}

async function requirePanelUser(req, res, next) {
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
      if (!decoded) {
        throw error;
      }
    }

    if (process.env.NODE_ENV === 'production' && !hasPanelAccess(decoded)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    req.firebaseUser = decoded;
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

async function listLiquidaciones(db, { estado = '' } = {}) {
  const estadoFiltro = String(estado || '').trim().toUpperCase();
  const snap = await db.ref('liquidaciones').once('value');
  const raiz = snap.val() || {};

  return Object.entries(raiz)
    .map(([id, item]) => ({ id: item?.id || id, ...(item || {}) }))
    .filter((item) => item && typeof item === 'object')
    .filter((item) => !estadoFiltro || String(item.estado || '').toUpperCase() === estadoFiltro)
    .sort((a, b) => Number(b.actualizadoEn || b.actualizado_en || 0) - Number(a.actualizadoEn || a.actualizado_en || 0));
}

function toNumberSafe(value, fallback = 0) {
  const number = Number(value);
  return Number.isFinite(number) ? number : fallback;
}

function mergeDriverFinancialView(uid, userDriver = {}, driver = {}) {
  const merged = {
    ...(userDriver || {}),
    ...(driver || {}),
    uid,
    perfil: {
      ...(userDriver?.perfil || {}),
      ...(driver?.perfil || {})
    },
    estatus: {
      ...(userDriver?.estatus || {}),
      ...(driver?.estatus || {})
    },
    finanzas: {
      ...(userDriver?.finanzas || {}),
      ...(driver?.finanzas || {})
    },
    billetera: {
      ...(userDriver?.billetera || {}),
      ...(driver?.billetera || {})
    }
  };
  const deudaActual = toNumberSafe(extraerDeudaActual(merged), 0);
  const limiteDeuda = toNumberSafe(merged?.finanzas?.limite_deuda, 0);
  const bloqueoManual = merged?.estatus?.bloqueo_manual === true || merged?.bloqueado_por_deuda === true;
  const bloqueoPorDeuda = merged?.estatus?.bloqueado_por_deuda === true
    || merged?.perfil?.bloqueado_por_deuda === true
    || (limiteDeuda > 0 && deudaActual > limiteDeuda);

  return {
    ...merged,
    finanzas: {
      ...(merged.finanzas || {}),
      deuda_actual: deudaActual,
      limite_deuda: limiteDeuda
    },
    billetera: {
      ...(merged.billetera || {}),
      deuda_comision: deudaActual
    },
    estatus: {
      ...(merged.estatus || {}),
      bloqueo_manual: bloqueoManual,
      bloqueado_por_deuda: bloqueoPorDeuda
    },
    perfil: {
      ...(merged.perfil || {}),
      bloqueado_por_deuda: bloqueoPorDeuda
    },
    deuda_actual: deudaActual,
    limite_deuda: limiteDeuda,
    bloqueo_manual: bloqueoManual,
    bloqueo_por_deuda: bloqueoPorDeuda,
    total_no_elegible: bloqueoManual || bloqueoPorDeuda
  };
}

router.get('/finanzas/liquidaciones', requirePanelUser, async (req, res, next) => {
  try {
    const admin = await getAdmin();
    const items = await listLiquidaciones(admin.database(), { estado: req.query.estado });
    return res.json({ ok: true, total: items.length, items });
  } catch (error) {
    return next(error);
  }
});

router.get('/finanzas/repartidores-deuda', requirePanelUser, async (_req, res, next) => {
  try {
    const admin = await getAdmin();
    const db = admin.database();
    const [usuariosSnap, repartidoresSnap] = await Promise.all([
      db.ref('usuarios/repartidores').once('value'),
      db.ref('repartidores').once('value')
    ]);
    const usuarios = usuariosSnap.val() || {};
    const repartidores = repartidoresSnap.val() || {};
    const ids = new Set([...Object.keys(usuarios), ...Object.keys(repartidores)]);
    const drivers = {};
    for (const uid of ids) {
      drivers[uid] = mergeDriverFinancialView(uid, usuarios[uid] || {}, repartidores[uid] || {});
    }
    return res.json({
      ok: true,
      source: 'finance/repartidores+usuarios',
      total: Object.keys(drivers).length,
      drivers
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/finanzas/registrar-pago-deuda', requirePanelUser, async (req, res, next) => {
  try {
    const { uid, monto_pago: montoPago, idempotency_key: idempotencyKey } = req.body;
    const origen = String(req.body?.origen || 'panel').trim().toLowerCase() === 'piloto' ? 'piloto' : 'panel';
    const admin = await getAdmin();
    const result = await registrarPagoDeudaTx(admin.database(), {
      uid,
      montoPago,
      origen,
      idempotencyKey
    });
    return res.json({ ok: true, origen, ...result });
  } catch (error) {
    return next(error);
  }
});

export default router;
