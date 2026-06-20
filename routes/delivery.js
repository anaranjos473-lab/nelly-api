import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual, registrarCobroEfectivoTx } from '../src/services/debtLockService.js';

const router = express.Router();

// Configuración de emails autorizados
const PANEL_ADMIN_EMAILS = new Set(
    String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
        .split(',')
        .map(e => e.trim().toLowerCase())
);

async function requireFirebaseUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    const admin = await getAdmin();
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

async function requireAdminOrPanel(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    const admin = await getAdmin();
    const decodedToken = await admin.auth().verifyIdToken(token);
    
    // Validar que sea admin o panel
    const email = String(decodedToken.email || '').toLowerCase();
    if (decodedToken.admin === true || decodedToken.role === 'panel_cocina' || PANEL_ADMIN_EMAILS.has(email)) {
      req.user = decodedToken;
      return next();
    }
    
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

async function getDriverState(db, uid) {
  const snap = await db.ref(`repartidores/${uid}`).once('value');
  return snap.val() || {};
}

function isDebtBlocked(driver) {
  const bloqueado = driver?.estatus?.bloqueado_por_deuda === true
    || driver?.perfil?.bloqueado_por_deuda === true;
  const deuda = extraerDeudaActual(driver);
  const limite = Number(driver?.finanzas?.limite_deuda || 0);
  return bloqueado || (limite > 0 && deuda > limite);
}

router.post('/accept-order', requireFirebaseUser, async (req, res, next) => {
  try {
    const { pedidoId } = req.body;
    const uid = req.firebaseUser.uid;
    if (!pedidoId) {
      return res.status(400).json({ ok: false, error: 'pedidoId es requerido' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const driver = await getDriverState(db, uid);
    if (isDebtBlocked(driver)) {
      return res.status(403).json({ ok: false, error: 'Limite de deuda alcanzado' });
    }

    const pedidoRef = db.ref(`pedidos_para_reparto/${pedidoId}`);
    const pedidoSnap = await pedidoRef.once('value');
    const pedido = pedidoSnap.val();
    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no disponible' });
    }
    if (pedido.repartidor_id && pedido.repartidor_id !== uid) {
      return res.status(409).json({ ok: false, error: 'El pedido ya fue tomado por otro repartidor' });
    }

    const acceptedAt = Date.now();
    const payload = {
      ...pedido,
      id_pedido: pedido.id_pedido || pedido.id || pedidoId,
      repartidor_id: uid,
      conductorId: uid,
      estado: 'EN_CAMINO',
      estado_pedido: 'EN_CAMINO',
      aceptado_en: acceptedAt
    };

    await Promise.all([
      db.ref(`pedidos_en_camino/${pedidoId}`).set(payload),
      pedidoRef.update({
        repartidor_id: uid,
        conductorId: uid,
        estado: 'EN_CAMINO',
        estado_pedido: 'EN_CAMINO',
        aceptado_en: acceptedAt
      }),
      db.ref(`repartidores/${uid}/pedido_activo`).set(pedidoId)
    ]);

    return res.json({ ok: true, pedidoId, repartidorId: uid });
  } catch (error) {
    return next(error);
  }
});

router.post('/update-location', requireFirebaseUser, async (req, res, next) => {
  try {
    const { lat, lng, pedidoId } = req.body;
    const uid = req.firebaseUser.uid;
    const latNum = Number(lat);
    const lngNum = Number(lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) {
      return res.status(400).json({ ok: false, error: 'lat y lng numericos son requeridos' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const timestamp = Date.now();
    const ubicacion = { lat: latNum, lng: lngNum, timestamp, pedidoId: pedidoId || null };

    const updates = {
      [`repartidores/${uid}/ubicacion`]: ubicacion,
      [`repartidores/${uid}/ultima_conexion`]: timestamp,
      [`conductores_activos/${uid}/lat`]: latNum,
      [`conductores_activos/${uid}/lng`]: lngNum,
      [`conductores_activos/${uid}/timestamp`]: timestamp
    };
    if (pedidoId) {
      updates[`pedidos_en_camino/${pedidoId}/ubicacion_repartidor`] = ubicacion;
    }

    await db.ref().update(updates);
    return res.json({ ok: true, ubicacion });
  } catch (error) {
    return next(error);
  }
});

router.post('/driver-offline', requireFirebaseUser, async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const admin = await getAdmin();
    const db = admin.database();
    const timestamp = Date.now();

    await db.ref().update({
      [`conductores_activos/${uid}`]: null,
      [`repartidores/${uid}/disponible`]: false,
      [`repartidores/${uid}/estado`]: 'OFFLINE',
      [`repartidores/${uid}/ultima_conexion`]: timestamp,
      [`repartidores/${uid}/offline_en`]: timestamp
    });

    return res.json({ ok: true, repartidorId: uid, estado: 'OFFLINE', offlineEn: timestamp });
  } catch (error) {
    return next(error);
  }
});

router.post('/complete-order', requireAdminOrPanel, async (req, res, next) => {
  try {
    const pedidoId = req.body.pedidoId || req.body.orderId;
    if (!pedidoId) {
      return res.status(400).json({ ok: false, error: 'pedidoId es requerido' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const pedidoRef = db.ref(`pedidos_en_camino/${pedidoId}`);
    const snap = await pedidoRef.once('value');
    const pedido = snap.val();
    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    const completedAt = Date.now();
    await Promise.all([
      pedidoRef.update({ estado: 'ENTREGADO', estado_pedido: 'ENTREGADO', entregado_en: completedAt }),
      db.ref(`pedidos/${pedidoId}`).update({ estado: 'ENTREGADO', estado_pedido: 'ENTREGADO', entregado_en: completedAt }),
      db.ref(`repartidores/${pedido.repartidor_id}/pedido_activo`).remove()
    ]);

    return res.json({ ok: true, pedidoId });
  } catch (error) {
    return next(error);
  }
});

router.post('/finanzas/registrar-cobro-efectivo', requireFirebaseUser, async (req, res, next) => {
  try {
    const { pedidoId, monto_efectivo: montoEfectivo } = req.body;
    const admin = await getAdmin();
    const result = await registrarCobroEfectivoTx(admin.database(), {
      uid: req.firebaseUser.uid,
      montoEfectivo,
      pedidoId,
      origen: 'delivery'
    });
    return res.json({ ok: true, ...result });
  } catch (error) {
    return next(error);
  }
});

export default router;
