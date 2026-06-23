import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual, registrarCobroEfectivoTx } from '../src/services/debtLockService.js';

const router = express.Router();

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
    
    // Validar que sea admin o panel - igual que en app_test.js
    if (decodedToken.admin === true || decodedToken.role === 'panel_cocina') {
      req.user = decodedToken;
      return next();
    }
    
    return res.status(403).json({ ok: false, error: 'No autorizado' });
  } catch (error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

async function requireFirebaseUserAnyRole(req, res, next) {
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

async function getDriverState(db, uid) {
  const snap = await db.ref(`repartidores/${uid}`).once('value');
  return snap.val() || {};
}

function isAdminOrPanelUser(user = {}) {
  return user.admin === true || user.role === 'panel_cocina';
}

function roundMoney(value) {
  return Math.round((Number(value || 0) + Number.EPSILON) * 100) / 100;
}

function getOrderTotal(pedido = {}) {
  const total = Number(
    pedido.monto_total
      ?? pedido.monto
      ?? pedido.total
      ?? pedido.total_pedido
      ?? 0
  );
  return Number.isFinite(total) ? total : 0;
}

function getDriverUidFromOrder(pedido = {}) {
  return pedido.repartidor_id || pedido.conductorId || pedido.driverUid || pedido.uid_repartidor || null;
}

function isDebtBlocked(driver) {
  const bloqueado = driver?.estatus?.bloqueado_por_deuda === true
    || driver?.perfil?.bloqueado_por_deuda === true;
  const deuda = extraerDeudaActual(driver);
  const limite = Number(driver?.finanzas?.limite_deuda || 0);
  return bloqueado || (limite > 0 && deuda > limite);
}

const ESTADOS_DISPONIBLES = new Set([
  'LISTO',
  'PENDIENTE',
  'LISTO_PARA_REPARTO',
  'ESPERANDO_REPARTIDOR',
  'DESPACHO'
]);

const ESTADOS_EN_CURSO = new Set([
  'EN_CAMINO',
  'EN_CURSO',
  'EN_REPARTO',
  'REPARTO'
]);

function normalizarEstadoPedido(estado) {
  return String(estado || '').trim().toUpperCase();
}

router.post('/dispatch-order', requireAdminOrPanel, async (req, res, next) => {
  try {
    const pedidoId = String(req.body?.pedidoId || req.body?.orderId || '').trim();
    if (!pedidoId) {
      return res.status(400).json({ ok: false, error: 'pedidoId es requerido' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const pedidoSnap = await db.ref(`pedidos/${pedidoId}`).once('value');
    const pedidoActual = pedidoSnap.val() || {};
    const pedidoInput = req.body?.pedido && typeof req.body.pedido === 'object' ? req.body.pedido : {};
    const dispatchedAt = Date.now();
    const pedidoBase = {
      ...pedidoInput,
      ...pedidoActual,
      id: pedidoActual.id || pedidoInput.id || pedidoId,
      id_pedido: pedidoActual.id_pedido || pedidoInput.id_pedido || pedidoId,
      pedido_id: pedidoActual.pedido_id || pedidoInput.pedido_id || pedidoId
    };
    const payloadListo = {
      ...pedidoBase,
      estado: 'PENDIENTE',
      estado_pedido: 'LISTO',
      hora_cocina: pedidoBase.hora_cocina || new Date(dispatchedAt).toISOString(),
      despachado_en: dispatchedAt,
      fuente_origen: pedidoBase.fuente_origen || 'panel_api',
      fase_panel: 'Despacho',
      logistica: {
        ...(pedidoBase.logistica || {}),
        estado: 'disponible',
        repartidor_id: null
      }
    };

    await Promise.all([
      db.ref(`pedidos/${pedidoId}`).update({
        estado: 'LISTO',
        estado_pedido: 'LISTO',
        hora_cocina: payloadListo.hora_cocina,
        despachado_en: dispatchedAt,
        fase_panel: 'Despacho'
      }),
      db.ref(`pedidos_para_reparto/${pedidoId}`).set(payloadListo)
    ]);

    return res.json({ ok: true, pedidoId, estado: 'LISTO', pedido: payloadListo });
  } catch (error) {
    return next(error);
  }
});

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
    const estadoActual = normalizarEstadoPedido(pedido.estado_pedido || pedido.estado);
    if (estadoActual && !ESTADOS_DISPONIBLES.has(estadoActual)) {
      return res.status(409).json({ ok: false, error: 'Transicion invalida: el pedido no esta listo para reparto', estadoActual });
    }

    const acceptedAt = Date.now();
    const payload = {
      ...pedido,
      id_pedido: pedido.id_pedido || pedido.id || pedidoId,
      repartidor_id: uid,
      conductorId: uid,
      estado: 'EN_CURSO',
      estado_pedido: 'EN_CAMINO',
      aceptado_en: acceptedAt
    };

    await Promise.all([
      db.ref(`pedidos_en_camino/${pedidoId}`).set(payload),
      pedidoRef.update({
        repartidor_id: uid,
        conductorId: uid,
        estado: 'EN_CURSO',
        estado_pedido: 'EN_CAMINO',
        aceptado_en: acceptedAt
      }),
      db.ref(`pedidos/${pedidoId}`).update({
        estado: 'EN_CAMINO',
        estado_pedido: 'EN_CAMINO',
        repartidor_id: uid,
        conductorId: uid,
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

router.post('/complete-order', requireFirebaseUserAnyRole, async (req, res, next) => {
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

    const estadoActual = normalizarEstadoPedido(pedido.estado_pedido || pedido.estado);
    if (estadoActual === 'ENTREGADO') {
      return res.json({
        ok: true,
        pedidoId,
        estado: 'ENTREGADO',
        alreadyCompleted: true,
        finanzas: null
      });
    }
    if (estadoActual && !ESTADOS_EN_CURSO.has(estadoActual)) {
      return res.status(409).json({ ok: false, error: 'Transicion invalida: el pedido aun no esta en reparto', estadoActual });
    }

    const driverUid = getDriverUidFromOrder(pedido);
    const user = req.firebaseUser || {};
    const isPanel = isAdminOrPanelUser(user);
    if (!isPanel) {
      if (!driverUid || driverUid !== user.uid) {
        return res.status(403).json({ ok: false, error: 'Solo el repartidor asignado puede completar este pedido' });
      }

      const activeSnap = await db.ref(`repartidores/${user.uid}/pedido_activo`).once('value');
      const activePedidoId = activeSnap.val();
      if (activePedidoId && activePedidoId !== pedidoId) {
        return res.status(409).json({ ok: false, error: 'El pedido no coincide con el pedido activo del repartidor' });
      }
    }

    const completedAt = Date.now();
    const montoPedido = getOrderTotal(pedido);
    const comision = roundMoney(
      req.body.comision
        ?? req.body.monto_comision
        ?? (montoPedido * 0.18)
    );
    const finanzas = driverUid && comision > 0
      ? await registrarCobroEfectivoTx(db, {
        uid: driverUid,
        montoEfectivo: comision,
        pedidoId,
        origen: 'complete-order'
      })
      : null;

    await Promise.all([
      pedidoRef.update({ estado: 'ENTREGADO', estado_pedido: 'ENTREGADO', entregado_en: completedAt }),
      db.ref(`pedidos/${pedidoId}`).update({ estado: 'ENTREGADO', estado_pedido: 'ENTREGADO', entregado_en: completedAt }),
      db.ref(`pedidos_para_reparto/${pedidoId}`).remove(),
      driverUid ? db.ref(`repartidores/${driverUid}/pedido_activo`).remove() : Promise.resolve()
    ]);

    return res.json({
      ok: true,
      pedidoId,
      estado: 'ENTREGADO',
      repartidorId: driverUid,
      montoPedido,
      comision,
      finanzas
    });
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
