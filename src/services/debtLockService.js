import { createLedgerEntry } from '../domain/index.js';

const LIMITES_DEUDA_POR_NIVEL = Object.freeze({
  BRONCE: 300,
  PLATA: 500,
  ORO: 600,
  DIAMANTE: 900
});

function toNumberSafe(value, fallback = 0) {
  const n = Number(value);
  return Number.isFinite(n) ? n : fallback;
}

function roundMoney(value) {
  return Math.round((toNumberSafe(value, 0) + Number.EPSILON) * 100) / 100;
}

export function normalizarNivel(nivelRaw) {
  const nivel = String(nivelRaw || 'BRONCE').trim().toUpperCase();
  return Object.prototype.hasOwnProperty.call(LIMITES_DEUDA_POR_NIVEL, nivel) ? nivel : 'BRONCE';
}

export function extraerNivel(actual = {}) {
  return normalizarNivel(actual?.estatus?.nivel || actual?.nivel || 'BRONCE');
}

export function extraerDeudaActual(actual = {}) {
  const deudaFinanzas = toNumberSafe(actual?.finanzas?.deuda_actual, NaN);
  if (Number.isFinite(deudaFinanzas)) {
    return deudaFinanzas;
  }
  return toNumberSafe(actual?.billetera?.deuda_comision, 0);
}

function extraerSaldoGanancias(actual = {}) {
  return toNumberSafe(actual?.finanzas?.saldo_ganancias, 0);
}

function resumenFinanciero(uid, result = {}) {
  return {
    uid,
    nivel: extraerNivel(result),
    deudaActual: toNumberSafe(result?.finanzas?.deuda_actual, 0),
    limiteDeuda: toNumberSafe(result?.finanzas?.limite_deuda, 0),
    saldoGanancias: toNumberSafe(result?.finanzas?.saldo_ganancias, 0),
    bloqueadoPorDeuda: Boolean(result?.estatus?.bloqueado_por_deuda)
  };
}

function buildDebtChargePayload(current, { uid, monto, pedidoId = null, origen = 'api', now = Date.now(), limite }) {
  const nivel = extraerNivel(current);
  const deudaActual = extraerDeudaActual(current);
  const saldoGanancias = extraerSaldoGanancias(current);
  const gananciaHoy = toNumberSafe(current?.finanzas?.ganancia_hoy, 0);
  const nuevaDeuda = roundMoney(deudaActual + monto);
  const nuevoSaldo = roundMoney(saldoGanancias + monto);
  const nuevaGananciaHoy = roundMoney(gananciaHoy + monto);
  const bloqueado = nuevaDeuda > limite;

  return {
    uid: current.uid || uid,
    estatus: {
      ...(current.estatus || {}),
      nivel,
      bloqueado_por_deuda: bloqueado,
      actualizado_en: now
    },
    perfil: {
      ...(current.perfil || {}),
      bloqueado_por_deuda: bloqueado
    },
    finanzas: {
      ...(current.finanzas || {}),
      deuda_actual: nuevaDeuda,
      limite_deuda: limite,
      saldo_ganancias: nuevoSaldo,
      ganancia_hoy: nuevaGananciaHoy,
      ultimo_cobro_efectivo: {
        monto,
        pedido_id: pedidoId || null,
        origen,
        timestamp: now
      }
    },
    billetera: {
      ...(current.billetera || {}),
      deuda_comision: nuevaDeuda
    }
  };
}

function buildDebtPaymentPayload(current, { monto, origen = 'panel', now = Date.now(), limite }) {
  const nivel = extraerNivel(current);
  const deudaActual = extraerDeudaActual(current);
  const saldoGanancias = extraerSaldoGanancias(current);
  const nuevaDeuda = roundMoney(Math.max(0, deudaActual - monto));
  const nuevoSaldo = roundMoney(Math.max(0, saldoGanancias - monto));
  const bloqueado = nuevaDeuda > limite;

  return {
    estatus: {
      ...(current.estatus || {}),
      nivel,
      bloqueado_por_deuda: bloqueado,
      actualizado_en: now
    },
    perfil: {
      ...(current.perfil || {}),
      bloqueado_por_deuda: bloqueado
    },
    finanzas: {
      ...(current.finanzas || {}),
      deuda_actual: nuevaDeuda,
      limite_deuda: limite,
      saldo_ganancias: nuevoSaldo,
      ultimo_pago_deuda: {
        monto,
        origen,
        timestamp: now
      }
    },
    billetera: {
      ...(current.billetera || {}),
      deuda_comision: nuevaDeuda
    }
  };
}

function buildDebtLedgerEntry({
  uid,
  tipo,
  subtipo,
  monto,
  pedidoId = null,
  origen = 'debt-lock-service',
  saldoAntes = 0,
  now = Date.now()
} = {}) {
  return createLedgerEntry({
    tipo,
    subtipo,
    origen,
    referencia_id: pedidoId || uid || 'debt',
    actor_id: uid || null,
    monto,
    saldo_antes: saldoAntes,
    moneda: 'MXN',
    ocurrio_en: now,
    registrado_en: now,
    metadata: {
      source: 'debtLockService'
    }
  });
}

export {
  buildDebtChargePayload,
  buildDebtPaymentPayload,
  buildDebtLedgerEntry
};

export async function registrarCobroEfectivoTx(db, { uid, montoEfectivo, pedidoId = null, origen = 'api' }) {
  const monto = roundMoney(montoEfectivo);
  if (!uid || monto <= 0) {
    throw new Error('uid y montoEfectivo (> 0) son requeridos');
  }

  // FIX: Leer el nodo ANTES de la transacción para evitar null en callback
  // Firebase RTDB tiene un comportamiento donde el callback puede recibir null
  // aunque el nodo exista, causando abort automático si retornas undefined
  const refPreread = db.ref(`repartidores/${uid}`);
  const snapPreread = await refPreread.once('value');
  const fallbackData = snapPreread.val() || {};

  const ref = db.ref(`repartidores/${uid}`);
  const tx = await ref.transaction((actual) => {
    // Usar fallback si actual es null (sucede con concurrencia en Firebase)
    const current = (actual && typeof actual === 'object') ? actual : fallbackData;
    return {
      ...current,
      ...buildDebtChargePayload(current, {
        uid,
        monto,
        pedidoId,
        origen,
        now: Date.now(),
        limite: LIMITES_DEUDA_POR_NIVEL[extraerNivel(current)]
      })
    };
  });

  if (!tx.committed || !tx.snapshot.exists()) {
    throw new Error('No se pudo aplicar el cobro en transaccion');
  }

  return resumenFinanciero(uid, tx.snapshot.val() || {});
}

export async function registrarPagoDeudaTx(db, { uid, montoPago, origen = 'panel' }) {
  const monto = roundMoney(montoPago);
  if (!uid || monto <= 0) {
    throw new Error('uid y montoPago (> 0) son requeridos');
  }

  // Igual que en el cobro en efectivo, hacemos un pre-read para evitar que
  // Firebase entregue null al callback de transaction y la operación se aborte.
  const refPreread = db.ref(`repartidores/${uid}`);
  const snapPreread = await refPreread.once('value');
  const fallbackData = snapPreread.val() || {};
  const current = (fallbackData && typeof fallbackData === 'object') ? fallbackData : null;
  if (!current) {
    throw new Error('No se pudo leer el estado actual del repartidor');
  }

  const nivel = extraerNivel(current);
  const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
  await refPreread.update({
    ...current,
    ...buildDebtPaymentPayload(current, {
      monto,
      origen,
      now: Date.now(),
      limite
    })
  });

  const refreshed = (await refPreread.once('value')).val() || {};
  return resumenFinanciero(uid, refreshed);
}
