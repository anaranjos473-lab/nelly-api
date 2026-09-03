import { createLedgerEntry } from '../domain/index.js';
import { appendFinancialEntry, buildFinancialEntry } from './financialCoreService.js';

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
    saldoEfectivo: toNumberSafe(result?.finanzas?.saldo_efectivo, 0),
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
    idempotency_key: `${tipo}:${pedidoId || uid}`,
    ocurrido_en: now,
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

export async function registrarComisionNellyTx(db, { uid, montoComision, pedidoId, origen = 'complete-order' }) {
  const monto = roundMoney(montoComision);
  if (!uid || monto <= 0 || !pedidoId) {
    throw new Error('uid, pedidoId y montoComision (> 0) son requeridos');
  }

  const entry = buildFinancialEntry({
    tipo: 'COMISION_NELLY',
    subtipo: 'pedido_entregado',
    origen,
    referencia_id: pedidoId,
    actor_id: uid,
    monto: -monto
  });
  const result = await appendFinancialEntry(db, entry);
  const ref = db.ref(`repartidores/${uid}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val() || {};
  const nivel = extraerNivel(current);
  const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
  const deuda = extraerDeudaActual(current);
  const bloqueado = deuda > limite;
  await ref.update({
    uid: current.uid || uid,
    estatus: { ...(current.estatus || {}), nivel, bloqueado_por_deuda: bloqueado, actualizado_en: Date.now() },
    perfil: { ...(current.perfil || {}), bloqueado_por_deuda: bloqueado },
    finanzas: { ...(current.finanzas || {}), limite_deuda: limite },
    billetera: { ...(current.billetera || {}), deuda_comision: deuda }
  });
  const refreshed = (await ref.once('value')).val() || {};
  return { ...resumenFinanciero(uid, refreshed), ledger: result };
}

export async function registrarCobroEfectivoTx(db, { uid, montoEfectivo, pedidoId = null, origen = 'api' }) {
  const monto = roundMoney(montoEfectivo);
  if (!uid || monto <= 0) {
    throw new Error('uid y montoEfectivo (> 0) son requeridos');
  }

  // FIX: Leer el nodo ANTES de la transacción para evitar null en callback
  // Firebase RTDB tiene un comportamiento donde el callback puede recibir null
  // aunque el nodo exista, causando abort automático si retornas undefined
  const entry = buildFinancialEntry({
    tipo: 'COBRO_EFECTIVO',
    subtipo: 'custodia_cliente',
    origen,
    referencia_id: pedidoId || `EFECTIVO:${uid}:${Date.now()}`,
    actor_id: uid,
    monto
  });
  const result = await appendFinancialEntry(db, entry);
  const ref = db.ref(`repartidores/${uid}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val() || {};
  const nivel = extraerNivel(current);
  const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
  const deuda = extraerDeudaActual(current);
  const bloqueado = deuda > limite;

  await ref.update({
    estatus: { ...(current.estatus || {}), nivel, bloqueado_por_deuda: bloqueado, actualizado_en: Date.now() },
    perfil: { ...(current.perfil || {}), bloqueado_por_deuda: bloqueado },
    finanzas: {
      ...(current.finanzas || {}),
      limite_deuda: limite,
      ultimo_cobro_efectivo: { monto, pedido_id: pedidoId || null, origen, timestamp: Date.now() }
    },
    billetera: { ...(current.billetera || {}), deuda_comision: deuda }
  });

  const refreshed = (await ref.once('value')).val() || {};
  return { ...resumenFinanciero(uid, refreshed), ledger: result };
}

export async function registrarPagoDeudaTx(db, {
  uid,
  montoPago,
  origen = 'panel',
  idempotencyKey = null
}) {
  const monto = roundMoney(montoPago);
  if (!uid || monto <= 0) {
    throw new Error('uid y montoPago (> 0) son requeridos');
  }

  // Igual que en el cobro en efectivo, hacemos un pre-read para evitar que
  // Firebase entregue null al callback de transaction y la operación se aborte.
  const referenciaId = idempotencyKey || `PAGO_DEUDA:${uid}:${Date.now()}`;
  const entry = buildFinancialEntry({
    tipo: 'LIQUIDACION',
    subtipo: 'DEUDA',
    origen,
    referencia_id: referenciaId,
    idempotency_key: idempotencyKey,
    actor_id: uid,
    monto: -monto
  });
  const result = await appendFinancialEntry(db, entry);
  const ref = db.ref(`repartidores/${uid}`);
  const snapshot = await ref.once('value');
  const current = snapshot.val() || {};
  const nivel = extraerNivel(current);
  const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
  const deuda = extraerDeudaActual(current);
  const bloqueado = deuda > limite;
  await ref.update({
    uid: current.uid || uid,
    estatus: { ...(current.estatus || {}), nivel, bloqueado_por_deuda: bloqueado, actualizado_en: Date.now() },
    perfil: { ...(current.perfil || {}), bloqueado_por_deuda: bloqueado },
    finanzas: {
      ...(current.finanzas || {}),
      deuda_actual: deuda,
      limite_deuda: limite,
      ultimo_pago_deuda: { monto, origen, timestamp: Date.now() }
    },
    billetera: { ...(current.billetera || {}), deuda_comision: deuda }
  });
  const refreshed = (await ref.once('value')).val() || {};
  return { ...resumenFinanciero(uid, refreshed), ledger: result };
}
