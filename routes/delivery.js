import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual, registrarCobroEfectivoTx } from '../src/services/debtLockService.js';
import { evaluarElegibilidadPedido, obtenerMontoPedido } from '../src/services/smartDispatchService.js';

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

function roundMoney(value) {
  const n = Number(value);
  return Number.isFinite(n) ? Math.round((n + Number.EPSILON) * 100) / 100 : 0;
}

function firstFiniteNumber(...values) {
  for (const value of values) {
    if (value === undefined || value === null || value === '') continue;
    const n = Number(value);
    if (Number.isFinite(n)) return n;
  }
  return null;
}

function emitSmartDispatchMetric(event, payload = {}) {
  console.info(JSON.stringify({
    event,
    source: 'smart_dispatch',
    timestamp: Date.now(),
    ...payload
  }));
}

function metricForRejection(faltantes = []) {
  if (faltantes.includes('billetera_guerra')) return 'SMART_DISPATCH_REJECTED_CAPITAL';
  if (faltantes.includes('radio_km') || faltantes.includes('ubicacion')) return 'SMART_DISPATCH_REJECTED_DISTANCE';
  if (faltantes.some((campo) => ['caja_grande', 'tensor', 'mochila_termica'].includes(campo))) {
    return 'SMART_DISPATCH_REJECTED_EQUIPMENT';
  }
  return 'SMART_DISPATCH_REJECTED';
}

function getReservaCapital(driver = {}, pedidoId) {
  return driver.finanzas?.reservas_capital?.[pedidoId]
    || driver.billetera?.reservas_capital?.[pedidoId]
    || null;
}

function aplicarReservaCapital(actual, pedidoId, monto, timestamp) {
  const billetera = actual.billetera || {};
  const finanzas = actual.finanzas || {};
  const reservas = { ...(finanzas.reservas_capital || {}) };
  const reservaActual = reservas[pedidoId];

  if (reservaActual?.estado === 'activa') {
    return actual;
  }

  const reservadoActual = firstFiniteNumber(
    billetera.capital_reservado,
    finanzas.capital_reservado,
    actual.capital_reservado
  ) || 0;
  const billeteraTotal = firstFiniteNumber(
    actual.billetera_guerra,
    billetera.billetera_guerra,
    finanzas.billetera_guerra,
    actual.perfil?.billetera_guerra
  );
  const capitalDisponibleActual = firstFiniteNumber(
    billetera.capital_disponible,
    billetera.efectivo_disponible,
    finanzas.capital_disponible,
    finanzas.efectivo_disponible
  );
  const nuevoReservado = roundMoney(reservadoActual + monto);
  const nuevoDisponible = billeteraTotal !== null
    ? Math.max(0, roundMoney(billeteraTotal - nuevoReservado))
    : (capitalDisponibleActual === null ? undefined : Math.max(0, roundMoney(capitalDisponibleActual - monto)));

  reservas[pedidoId] = {
    monto,
    estado: 'activa',
    creado_en: timestamp,
    actualizado_en: timestamp
  };

  return {
    ...actual,
    capital_reservado: nuevoReservado,
    billetera: {
      ...billetera,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: {
        ...(billetera.reservas_capital || {}),
        [pedidoId]: reservas[pedidoId]
      }
    },
    finanzas: {
      ...finanzas,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: reservas
    }
  };
}

function aplicarLiberacionCapital(actual, pedidoId, montoLiberar, timestamp) {
  if (!actual || typeof actual !== 'object') return;

  const billetera = actual.billetera || {};
  const finanzas = actual.finanzas || {};
  const reservas = { ...(finanzas.reservas_capital || {}) };
  const reservasBilletera = { ...(billetera.reservas_capital || {}) };
  const reserva = reservas[pedidoId] || reservasBilletera[pedidoId] || null;
  if (reserva?.estado !== 'activa') {
    return actual;
  }

  const monto = roundMoney(montoLiberar || reserva?.monto || 0);
  if (monto <= 0) {
    return actual;
  }

  const reservadoActual = firstFiniteNumber(
    billetera.capital_reservado,
    finanzas.capital_reservado,
    actual.capital_reservado
  ) || 0;
  const billeteraTotal = firstFiniteNumber(
    actual.billetera_guerra,
    billetera.billetera_guerra,
    finanzas.billetera_guerra,
    actual.perfil?.billetera_guerra
  );
  const capitalDisponibleActual = firstFiniteNumber(
    billetera.capital_disponible,
    billetera.efectivo_disponible,
    finanzas.capital_disponible,
    finanzas.efectivo_disponible
  );
  const nuevoReservado = Math.max(0, roundMoney(reservadoActual - monto));
  const nuevoDisponible = billeteraTotal !== null
    ? Math.max(0, roundMoney(billeteraTotal - nuevoReservado))
    : (capitalDisponibleActual === null ? undefined : roundMoney(capitalDisponibleActual + monto));

  delete reservas[pedidoId];
  delete reservasBilletera[pedidoId];

  return {
    ...actual,
    capital_reservado: nuevoReservado,
    billetera: {
      ...billetera,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: reservasBilletera
    },
    finanzas: {
      ...finanzas,
      capital_reservado: nuevoReservado,
      ...(nuevoDisponible === undefined ? {} : { capital_disponible: nuevoDisponible }),
      reservas_capital: reservas
    }
  };
}

async function reservarCapitalTx(db, { uid, pedidoId, pedido, timestamp }) {
  const monto = roundMoney(obtenerMontoPedido(pedido));
  console.info(JSON.stringify({ event: 'reservarCapitalTx.start', uid, pedidoId, monto, timestamp }));
  if (monto <= 0) {
    return { ok: true, montoReservado: 0, elegibilidad: evaluarElegibilidadPedido(pedido, await getDriverState(db, uid)) };
  }

  const ref = db.ref(`repartidores/${uid}`);
  let elegibilidadFinal = null;
  let reservaExistente = false;
  let callbackCount = 0;

  const tx = await ref.transaction((actual) => {
    callbackCount += 1;
    console.info(JSON.stringify({ event: 'reservarCapitalTx.txCallback', uid, pedidoId, callbackCount, actualType: actual === null ? 'null' : typeof actual }));
    if (actual === null) {
      return null;
    }

    if (!actual || typeof actual !== 'object') {
      return;
    }

    const reserva = getReservaCapital(actual, pedidoId);
    console.info(JSON.stringify({ event: 'reservarCapitalTx.reservaCheck', uid, pedidoId, reserva }));
    if (reserva?.estado === 'activa') {
      reservaExistente = true;
      elegibilidadFinal = evaluarElegibilidadPedido(pedido, actual);
      console.info(JSON.stringify({ event: 'reservarCapitalTx.existingReservation', uid, pedidoId, elegibilidadFinal }));
      return actual;
    }

    elegibilidadFinal = evaluarElegibilidadPedido(pedido, actual);
    console.info(JSON.stringify({ event: 'reservarCapitalTx.elegibilidad', uid, pedidoId, elegibilidadFinal }));
    if (!elegibilidadFinal.ok) {
      return;
    }

    return aplicarReservaCapital(actual, pedidoId, monto, timestamp);
  });

  if (!tx.committed || !tx.snapshot.exists()) {
    return {
      ok: false,
      error: 'Repartidor no elegible para este pedido',
      faltantes: elegibilidadFinal?.faltantes || ['billetera_guerra'],
      elegibilidad: elegibilidadFinal
    };
  }

  return {
    ok: true,
    montoReservado: monto,
    reservaExistente,
    elegibilidad: elegibilidadFinal || evaluarElegibilidadPedido(pedido, tx.snapshot.val() || {})
  };
}

async function liberarCapitalReservadoTx(db, { uid, pedidoId, monto, timestamp }) {
  const ref = db.ref(`repartidores/${uid}`);
  const tx = await ref.transaction((actual) => {
    if (actual === null) {
      return null;
    }
    return aplicarLiberacionCapital(actual, pedidoId, monto, timestamp);
  });
  return tx.committed && tx.snapshot.exists();
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
    const repartidorActual = pedido.repartidor_id || pedido.conductorId || pedido.idConductor || pedido.logistica?.repartidor_id;
    if (repartidorActual && repartidorActual !== uid) {
      return res.status(409).json({ ok: false, error: 'El pedido ya fue tomado por otro repartidor' });
    }
    const estadoPedidoActual = String(pedido.estado_pedido || pedido.estado || pedido.logistica?.estado || '').trim().toLowerCase();
    if (repartidorActual === uid && ['en_camino', 'tomado'].includes(estadoPedidoActual)) {
      const elegibilidadActual = evaluarElegibilidadPedido(pedido, driver);
      return res.json({ ok: true, pedidoId, repartidorId: uid, alreadyAccepted: true, elegibilidad: elegibilidadActual });
    }

    const elegibilidad = evaluarElegibilidadPedido(pedido, driver);
    if (!elegibilidad.ok) {
      emitSmartDispatchMetric(metricForRejection(elegibilidad.faltantes), {
        pedidoId,
        repartidorId: uid,
        faltantes: elegibilidad.faltantes,
        dispatchScore: elegibilidad.dispatchScore
      });
      return res.status(403).json({
        ok: false,
        error: 'Repartidor no elegible para este pedido',
        faltantes: elegibilidad.faltantes,
        elegibilidad
      });
    }
    emitSmartDispatchMetric('SMART_DISPATCH_ELIGIBLE', {
      pedidoId,
      repartidorId: uid,
      dispatchScore: elegibilidad.dispatchScore
    });

    const acceptedAt = Date.now();
    const reserva = await reservarCapitalTx(db, { uid, pedidoId, pedido, timestamp: acceptedAt });
    if (!reserva.ok) {
      emitSmartDispatchMetric(metricForRejection(reserva.faltantes), {
        pedidoId,
        repartidorId: uid,
        faltantes: reserva.faltantes,
        dispatchScore: reserva.elegibilidad?.dispatchScore || 0
      });
      return res.status(403).json({
        ok: false,
        error: reserva.error,
        faltantes: reserva.faltantes,
        elegibilidad: reserva.elegibilidad
      });
    }

    const tx = await pedidoRef.transaction((actual) => {
      if (actual === null) {
        return null;
      }

      if (!actual || typeof actual !== 'object') {
        return;
      }

      const logistica = actual.logistica && typeof actual.logistica === 'object' ? actual.logistica : {};
      const asignadoActual = actual.repartidor_id || actual.conductorId || actual.idConductor || logistica.repartidor_id;
      const estadoActual = String(actual.estado_pedido || actual.estado || logistica.estado || '').trim().toLowerCase();
      const disponible = !asignadoActual
        || asignadoActual === uid
        || ['listo', 'listo_para_reparto', 'esperando_repartidor', 'disponible'].includes(estadoActual);

      if (!disponible) {
        return;
      }

      return {
        ...actual,
        id_pedido: actual.id_pedido || actual.id || pedidoId,
        repartidor_id: uid,
        conductorId: uid,
        idConductor: uid,
        estado: 'EN_CAMINO',
        estado_pedido: 'EN_CAMINO',
        aceptado_en: acceptedAt,
        capital_reserva: {
          monto: reserva.montoReservado,
          repartidor_id: uid,
          estado: reserva.montoReservado > 0 ? 'activa' : 'no_requerida',
          reservado_en: acceptedAt
        },
        logistica: {
          ...logistica,
          estado: 'tomado',
          repartidor_id: uid,
          tomado_en: acceptedAt,
          dispatchScore: reserva.elegibilidad.dispatchScore,
          capital_reserva: {
            monto: reserva.montoReservado,
            estado: reserva.montoReservado > 0 ? 'activa' : 'no_requerida',
            reservado_en: acceptedAt
          }
        }
      };
    });

    if (!tx.committed || !tx.snapshot.exists()) {
      await liberarCapitalReservadoTx(db, {
        uid,
        pedidoId,
        monto: reserva.montoReservado,
        timestamp: Date.now()
      });
      return res.status(409).json({ ok: false, error: 'El pedido ya fue tomado por otro repartidor' });
    }

    const payload = tx.snapshot.val();

    await Promise.all([
      db.ref(`pedidos_en_camino/${pedidoId}`).set(payload),
      db.ref(`pedidos/${pedidoId}`).update({
        repartidor_id: uid,
        conductorId: uid,
        idConductor: uid,
        estado: 'EN_CAMINO',
        estado_pedido: 'EN_CAMINO',
        aceptado_en: acceptedAt,
        capital_reserva: payload.capital_reserva || null,
        logistica: {
          ...(pedido.logistica || {}),
          ...(payload.logistica || {})
        }
      }),
      db.ref(`repartidores/${uid}/pedido_activo`).set(pedidoId)
    ]);

    emitSmartDispatchMetric('SMART_DISPATCH_ACCEPTED', {
      pedidoId,
      repartidorId: uid,
      montoReservado: reserva.montoReservado,
      dispatchScore: reserva.elegibilidad.dispatchScore
    });

    return res.json({
      ok: true,
      pedidoId,
      repartidorId: uid,
      montoReservado: reserva.montoReservado,
      elegibilidad: reserva.elegibilidad
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
      updates[`pedidos_en_camino/${pedidoId}/ubicacion_repartidor`] = ubicacion;
    }

    await db.ref().update(updates);
    return res.json({ ok: true, ubicacion });
  } catch (error) {
    return next(error);
  }
});

router.post('/complete-order', requireFirebaseUser, async (req, res, next) => {
  try {
    const pedidoId = req.body.pedidoId || req.body.orderId;
    const uid = req.firebaseUser.uid;
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
    if (pedido.repartidor_id && pedido.repartidor_id !== uid) {
      return res.status(403).json({ ok: false, error: 'Pedido asignado a otro repartidor' });
    }

    const completedAt = Date.now();
    const reserva = pedido.capital_reserva || pedido.logistica?.capital_reserva || {};
    const montoReservado = roundMoney(reserva.monto || obtenerMontoPedido(pedido));
    const capitalReservaLiberada = {
      ...reserva,
      estado: 'liberada',
      liberado_en: completedAt
    };
    const logisticaLiberada = {
      ...(pedido.logistica || {}),
      estado: 'entregado',
      capital_reserva: {
        ...(pedido.logistica?.capital_reserva || reserva),
        estado: 'liberada',
        liberado_en: completedAt
      }
    };
    const capitalLiberado = await liberarCapitalReservadoTx(db, {
      uid,
      pedidoId,
      monto: montoReservado,
      timestamp: completedAt
    });
    if (!capitalLiberado) {
      return res.status(409).json({
        ok: false,
        error: 'No se pudo liberar capital reservado'
      });
    }

    await Promise.all([
      pedidoRef.update({
        estado: 'ENTREGADO',
        estado_pedido: 'ENTREGADO',
        entregado_en: completedAt,
        capital_reserva: capitalReservaLiberada,
        logistica: logisticaLiberada
      }),
      db.ref(`pedidos/${pedidoId}`).update({
        estado: 'ENTREGADO',
        estado_pedido: 'ENTREGADO',
        entregado_en: completedAt,
        capital_reserva: capitalReservaLiberada,
        logistica: logisticaLiberada
      }),
      db.ref(`repartidores/${uid}/pedido_activo`).remove()
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
