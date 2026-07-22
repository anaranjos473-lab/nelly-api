import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual, registrarCobroEfectivoTx } from '../src/services/debtLockService.js';
import {
  ESTADOS_EN_CURSO,
  buildAcceptedOrderPayload,
  buildCompletedOrderPayload,
  buildDriverOfflinePayload,
  buildDriverOnlinePayload,
  canAcceptOrder,
  canCompleteOrder,
  estadoOperativo,
  firstPositiveMoney,
  getDeliveryPayout,
  getDriverUidFromOrder,
  getOrderTotal,
  limpiarAsignacionParaPool,
  esTransicionOperativaPermitida,
  shouldAdvancePedidoState,
  roundMoney
} from '../src/services/ordersManager.js';
import { verifyToken } from '../src/utils/jwt.js';

const router = express.Router();

async function resolveAuthenticatedUser(token) {
  if (process.env.DEV_AUTH_TOKEN && token === process.env.DEV_AUTH_TOKEN) {
    return {
      uid: process.env.DEV_AUTH_UID || 'dev-user',
      admin: false,
      role: 'driver'
    };
  }

  try {
    const admin = await getAdmin();
    return await admin.auth().verifyIdToken(token);
  } catch (error) {
    try {
      const decoded = verifyToken(token);
      return {
        uid: decoded.uid || decoded.sub,
        admin: Boolean(decoded.admin),
        panel: Boolean(decoded.panel),
        role: decoded.role || (decoded.driver ? 'driver' : undefined),
        ...decoded
      };
    } catch (jwtError) {
      console.error('[AUTH][DELIVERY] No se pudo resolver token', { message: error.message, jwtMessage: jwtError.message });
      throw error;
    }
  }
}

async function requireFirebaseUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    req.firebaseUser = await resolveAuthenticatedUser(token);
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

  if (process.env.DEV_AUTH_TOKEN && token === process.env.DEV_AUTH_TOKEN) {
    req.user = {
      uid: process.env.DEV_AUTH_UID || 'dev-user',
      admin: true,
      panel: true,
      role: 'panel_cocina'
    };
    return next();
  }

  try {
    const decodedToken = await resolveAuthenticatedUser(token);

    if (decodedToken.admin === true || decodedToken.role === 'panel_cocina' || decodedToken.panel === true) {
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
    req.firebaseUser = await resolveAuthenticatedUser(token);
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
  return user.admin === true || user.panel === true || user.role === 'panel_cocina';
}

function generateShortId(timestamp) {
  const date = new Date(Number(timestamp) || Date.now());
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day = String(date.getUTCDate()).padStart(2, '0');
  const suffix = String(Math.floor(Math.random() * 90) + 10);
  return `${month}${day}-${suffix}`;
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
    const pedidoPool = limpiarAsignacionParaPool(pedidoBase);
    const payloadListo = {
      ...pedidoPool,
      shortId: pedidoBase.shortId || generateShortId(pedidoBase.fecha_creacion || pedidoBase.createdAt || pedidoBase.created_at || dispatchedAt),
      estado: 'LISTO',
      estado_pedido: 'LISTO',
      hora_cocina: pedidoBase.hora_cocina || new Date(dispatchedAt).toISOString(),
      fecha: pedidoBase.fecha || pedidoBase.fecha_creacion || pedidoBase.createdAt || pedidoBase.created_at || dispatchedAt,
      despachado_en: dispatchedAt,
      fuente_origen: pedidoBase.fuente_origen || 'panel_api',
      fase_panel: 'Despacho',
      logistica: {
        ...(pedidoPool.logistica || {}),
        estado: 'ESPERANDO_REPARTIDOR'
      },
      disponible: true
    };

    await Promise.all([
      db.ref(`pedidos/${pedidoId}`).update(payloadListo),
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
    const pedidoRef = db.ref(`pedidos/${pedidoId}`);
    const pedidoSnap = await pedidoRef.once('value');
    const pedido = pedidoSnap.val();
    const acceptCheck = canAcceptOrder({ driver: await getDriverState(db, uid), order: pedido, uid });
    if (!acceptCheck.ok) {
      const payload = { ok: false, error: acceptCheck.error };
      if (acceptCheck.estadoActual) payload.estadoActual = acceptCheck.estadoActual;
      return res.status(acceptCheck.status).json(payload);
    }

    const acceptedAt = Date.now();
    const payload = buildAcceptedOrderPayload(pedido, uid, acceptedAt);

    await Promise.all([
      pedidoRef.update(payload),
      db.ref(`repartidores/${uid}/pedido_activo`).set(pedidoId),
      db.ref(`pedidos_para_reparto/${pedidoId}`).remove(),
      db.ref(`pedidos_en_camino/${pedidoId}`).set(payload)
    ]);

    return res.json({ ok: true, pedidoId, repartidorId: uid });
  } catch (error) {
    return next(error);
  }
});

router.post('/transition-order', requireFirebaseUser, async (req, res, next) => {
  try {
    const pedidoId = String(req.body?.pedidoId || req.body?.orderId || '').trim();
    const estadoSiguiente = normalizeOrderState(req.body?.estado || req.body?.estadoSiguiente);
    const uid = req.firebaseUser.uid;
    if (!pedidoId || !estadoSiguiente) {
      return res.status(400).json({ ok: false, error: 'pedidoId y estado son requeridos' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const pedido = (await db.ref(`pedidos/${pedidoId}`).once('value')).val();
    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    const driverUid = getDriverUidFromOrder(pedido);
    if (!driverUid || driverUid !== uid) {
      return res.status(403).json({ ok: false, error: 'Solo el repartidor asignado puede cambiar este pedido' });
    }
    const activePedidoId = (await db.ref(`repartidores/${uid}/pedido_activo`).once('value')).val();
    if (activePedidoId && activePedidoId !== pedidoId) {
      return res.status(409).json({ ok: false, error: 'El pedido no coincide con el pedido activo del repartidor' });
    }

    const estadoActual = normalizeOrderState(pedido.estado_pedido || pedido.estado);
    if (!esTransicionOperativaPermitida(estadoActual, estadoSiguiente)) {
      return res.status(409).json({
        ok: false,
        error: 'Transicion operativa invalida',
        estadoActual,
        estadoSiguiente
      });
    }

    const updatedAt = Date.now();
    const estadoUpdates = {
      estado: estadoSiguiente,
      estado_pedido: estadoSiguiente,
      logistica: { ...(pedido.logistica || {}), estado: estadoSiguiente },
      timestampActualizacion: updatedAt
    };
    const pedidoEnCamino = { ...pedido, ...estadoUpdates };
    const updates = {
      [`pedidos/${pedidoId}/estado`]: estadoSiguiente,
      [`pedidos/${pedidoId}/estado_pedido`]: estadoSiguiente,
      [`pedidos/${pedidoId}/logistica/estado`]: estadoSiguiente,
      [`pedidos/${pedidoId}/timestampActualizacion`]: updatedAt,
      [`pedidos_en_camino/${pedidoId}`]: pedidoEnCamino
    };
    await db.ref().update(updates);

    return res.json({
      ok: true,
      pedidoId,
      repartidorId: uid,
      estadoAnterior: estadoActual,
      estado: estadoSiguiente,
      idempotent: estadoActual === estadoSiguiente
    });
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
      updates[`pedidos/${pedidoId}/ubicacion_repartidor`] = ubicacion;

      const estadoPayload = String(req.body?.estado || req.body?.estado_pedido || req.body?.subestado || '').trim().toUpperCase();
      if (estadoPayload) {
        const estadoPersistido = normalizeOrderState(estadoPayload);
        const pedidoActual = (await db.ref(`pedidos/${pedidoId}`).once('value')).val() || {};
        const estadoActual = pedidoActual?.estado_pedido || pedidoActual?.estado || '';
        if (shouldAdvancePedidoState(estadoActual, estadoPersistido)) {
          updates[`pedidos/${pedidoId}/estado`] = estadoPersistido;
          updates[`pedidos/${pedidoId}/estado_pedido`] = estadoPersistido;
          updates[`pedidos/${pedidoId}/logistica/estado`] = estadoPersistido;
        }
      }

      const fasePanel = typeof req.body?.fase_panel === 'string' && req.body.fase_panel.trim()
        ? req.body.fase_panel.trim()
        : null;
      if (fasePanel) {
        updates[`pedidos/${pedidoId}/fase_panel`] = fasePanel;
      }
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

    await db.ref().update(buildDriverOfflinePayload(uid, timestamp));

    return res.json({ ok: true, repartidorId: uid, estado: 'OFFLINE', offlineEn: timestamp });
  } catch (error) {
    return next(error);
  }
});

router.post('/driver-online', requireFirebaseUser, async (req, res, next) => {
  try {
    const uid = req.firebaseUser.uid;
    const admin = await getAdmin();
    const db = admin.database();
    const timestamp = Date.now();
    const activePedidoId = (await db.ref(`repartidores/${uid}/pedido_activo`).once('value')).val();

    const updates = buildDriverOnlinePayload(uid, activePedidoId, timestamp);

    await db.ref().update(updates);
    return res.json({
      ok: true,
      repartidorId: uid,
      estado: 'DISPONIBLE',
      disponible: true,
      pedidoActivo: activePedidoId || null,
      onlineEn: timestamp
    });
  } catch (error) {
    return next(error);
  }
});

router.post('/complete-order', requireFirebaseUserAnyRole, async (req, res, next) => {
  try {
    const pedidoId = req.body.pedidoId || req.body.orderId;
    const completionType = String(req.body.completion_type || req.body.completionType || 'normal').trim().toLowerCase();
    if (!pedidoId) {
      return res.status(400).json({ ok: false, error: 'pedidoId es requerido' });
    }

    const admin = await getAdmin();
    const db = admin.database();
    const pedidoRef = db.ref(`pedidos/${pedidoId}`);
    const snap = await pedidoRef.once('value');
    const pedido = snap.val();
    if (!pedido) {
      return res.status(404).json({ ok: false, error: 'Pedido no encontrado' });
    }

    const user = req.firebaseUser || {};
    const isPanel = isAdminOrPanelUser(user);
    const completionCheck = canCompleteOrder({ order: pedido, uid: user.uid, isPanel });
    if (!completionCheck.ok) {
      const payload = { ok: false, error: completionCheck.error };
      if (completionCheck.estadoActual) payload.estadoActual = completionCheck.estadoActual;
      return res.status(completionCheck.status).json(payload);
    }
    const { alreadyCompleted } = completionCheck;
    const driverUid = getDriverUidFromOrder(pedido);

    const completedAt = Date.now();
    const montoPedido = getOrderTotal(pedido);
    const comisionSolicitada = firstPositiveMoney(req.body.comision, req.body.monto_comision);
    const comisionFallback = getDeliveryPayout(pedido) || roundMoney(montoPedido * 0.18);
    const comision = comisionSolicitada || comisionFallback;
    const finanzas = !alreadyCompleted && driverUid && comision > 0
      ? await registrarCobroEfectivoTx(db, {
        uid: driverUid,
        montoEfectivo: comision,
        pedidoId,
        origen: 'complete-order'
      })
      : null;

    const pedidoUpdates = buildCompletedOrderPayload(
      pedido,
      completedAt,
      completionType,
      comision,
      firstPositiveMoney(pedido.tarifa_entrega, pedido.costo_envio, pedido.costoEnvio)
    );
    if (req.body.evidenciaUrl) {
      pedidoUpdates.evidencia_url = req.body.evidenciaUrl;
    }
    if (req.body.evidenciaFallback) {
      pedidoUpdates.evidencia_fallback = true;
      pedidoUpdates.evidencia_tipo = 'base64';
      pedidoUpdates.evidencia_mime = 'image/jpeg';
      pedidoUpdates.evidencia_storage_fallback_at = completedAt;
      pedidoUpdates.evidencia_storage_error = String(req.body.storageError || '').slice(0, 240);
    }
    const updates = {
      [`pedidos/${pedidoId}`]: { ...pedido, ...pedidoUpdates },
      [`pedidos_en_camino/${pedidoId}`]: null,
      [`pedidos_para_reparto/${pedidoId}`]: null
    };
    if (driverUid) {
      updates[`repartidores/${driverUid}/pedido_activo`] = null;
    }
    await db.ref().update(updates);

    return res.json({
      ok: true,
      pedidoId,
      estado: 'ENTREGADO',
      repartidorId: driverUid,
      montoPedido,
      comision,
      finanzas,
      alreadyCompleted,
      completionType: pedidoUpdates.completion_type
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
