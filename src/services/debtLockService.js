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

export async function registrarCobroEfectivoTx(db, { uid, montoEfectivo, pedidoId = null, origen = 'api' }) {
  const monto = roundMoney(montoEfectivo);
  if (!uid || monto <= 0) {
    throw new Error('uid y montoEfectivo (> 0) son requeridos');
  }

  const ref = db.ref(`repartidores/${uid}`);
  const tx = await ref.transaction((actual) => {
    if (actual === null) {
      return null;
    }

    if (!actual || typeof actual !== 'object') {
      return;
    }

    const nivel = extraerNivel(actual);
    const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
    const deudaActual = extraerDeudaActual(actual);
    const saldoGanancias = extraerSaldoGanancias(actual);
    const nuevaDeuda = roundMoney(deudaActual + monto);
    const nuevoSaldo = roundMoney(saldoGanancias + monto);
    const bloqueado = nuevaDeuda > limite;
    const ahora = Date.now();

    return {
      ...actual,
      estatus: {
        ...(actual.estatus || {}),
        nivel,
        bloqueado_por_deuda: bloqueado,
        actualizado_en: ahora
      },
      perfil: {
        ...(actual.perfil || {}),
        bloqueado_por_deuda: bloqueado
      },
      finanzas: {
        ...(actual.finanzas || {}),
        deuda_actual: nuevaDeuda,
        limite_deuda: limite,
        saldo_ganancias: nuevoSaldo,
        ultimo_cobro_efectivo: {
          monto,
          pedido_id: pedidoId || null,
          origen,
          timestamp: ahora
        }
      },
      billetera: {
        ...(actual.billetera || {}),
        deuda_comision: nuevaDeuda
      }
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

  const ref = db.ref(`repartidores/${uid}`);
  const tx = await ref.transaction((actual) => {
    if (actual === null) {
      return null;
    }

    if (!actual || typeof actual !== 'object') {
      return;
    }

    const nivel = extraerNivel(actual);
    const limite = LIMITES_DEUDA_POR_NIVEL[nivel];
    const deudaActual = extraerDeudaActual(actual);
    const saldoGanancias = extraerSaldoGanancias(actual);
    const nuevaDeuda = roundMoney(Math.max(0, deudaActual - monto));
    const nuevoSaldo = roundMoney(Math.max(0, saldoGanancias - monto));
    const bloqueado = nuevaDeuda > limite;
    const ahora = Date.now();

    return {
      ...actual,
      estatus: {
        ...(actual.estatus || {}),
        nivel,
        bloqueado_por_deuda: bloqueado,
        actualizado_en: ahora
      },
      perfil: {
        ...(actual.perfil || {}),
        bloqueado_por_deuda: bloqueado
      },
      finanzas: {
        ...(actual.finanzas || {}),
        deuda_actual: nuevaDeuda,
        limite_deuda: limite,
        saldo_ganancias: nuevoSaldo,
        ultimo_pago_deuda: {
          monto,
          origen,
          timestamp: ahora
        }
      },
      billetera: {
        ...(actual.billetera || {}),
        deuda_comision: nuevaDeuda
      }
    };
  });

  if (!tx.committed || !tx.snapshot.exists()) {
    throw new Error('No se pudo aplicar el pago en transaccion');
  }

  return resumenFinanciero(uid, tx.snapshot.val() || {});
}
