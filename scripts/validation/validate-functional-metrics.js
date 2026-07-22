import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const ROOT = process.cwd();
const STATE_PATH = path.join(ROOT, '.codex-tmp', 'pedido-c-state.json');
const BASELINE_PATH = path.join(ROOT, 'docs', 'certificaciones', 'functional-metrics-baseline.json');
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
const EXPECTED_BASELINE_ORDER = process.env.FUNCTIONAL_METRICS_PEDIDO_ID || null;

function loadServiceAccount() {
  const localPath = path.join(ROOT, 'nelly-admin.json');
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

function readState() {
  if (!fs.existsSync(STATE_PATH)) {
    throw new Error(`No existe el estado de corrida: ${STATE_PATH}`);
  }
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function readBaseline() {
  if (!fs.existsSync(BASELINE_PATH)) {
    throw new Error(`No existe el baseline funcional: ${BASELINE_PATH}`);
  }
  return JSON.parse(fs.readFileSync(BASELINE_PATH, 'utf8'));
}

function normalizeState(order = {}) {
  return String(order?.estado_pedido || order?.estado || '').trim().toUpperCase();
}

function countClean(value) {
  return value == null ? 0 : 1;
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

async function main() {
  const state = readState();
  const baseline = readBaseline();
  const pedidoId = EXPECTED_BASELINE_ORDER || state.pedidoId;
  const driverUid = state.driverUid;

  if (!pedidoId) {
    throw new Error('No se pudo determinar el pedido de referencia');
  }
  if (!driverUid) {
    throw new Error('No se pudo determinar el driver de referencia');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(loadServiceAccount()),
      databaseURL: DATABASE_URL
    });
  }

  const db = admin.database();
  const [pedidoSnap, repartoSnap, caminoSnap, activoSnap, driverSnap] = await Promise.all([
    db.ref(`pedidos/${pedidoId}`).once('value'),
    db.ref(`pedidos_para_reparto/${pedidoId}`).once('value'),
    db.ref(`pedidos_en_camino/${pedidoId}`).once('value'),
    db.ref(`repartidores/${driverUid}/pedido_activo`).once('value'),
    db.ref(`repartidores/${driverUid}`).once('value')
  ]);

  const pedido = pedidoSnap.val() || {};
  const driver = driverSnap.val() || {};
  const estadoFinal = normalizeState(pedido);
  const pedidoActivo = activoSnap.exists() ? activoSnap.val() : null;
  const pedidosParaReparto = repartoSnap.exists() ? repartoSnap.val() : null;
  const pedidosEnCamino = caminoSnap.exists() ? caminoSnap.val() : null;

  const metricas = {
    pedido_creado: countClean(pedido?.createdAt || pedido?.created_at || pedido?.fecha_creacion),
    pedido_publicado: countClean(pedido?.despachado_en),
    pedido_aceptado: countClean(pedido?.aceptado_en),
    pedido_entregado: estadoFinal === 'ENTREGADO' ? 1 : 0,
    pedido_activo_residual: pedidoActivo ? 1 : 0
  };

  const residuals = {
    pedidos_para_reparto: repartoSnap.exists() ? 1 : 0,
    pedidos_en_camino: caminoSnap.exists() ? 1 : 0,
    pedido_activo: pedidoActivo ? 1 : 0
  };

  const financial = {
    deuda_actual: Number(driver?.finanzas?.deuda_actual || 0),
    limite_deuda: Number(driver?.finanzas?.limite_deuda || 0),
    saldo_ganancias: Number(driver?.finanzas?.saldo_ganancias || 0),
    ganancia_neta_pedido: Number(pedido?.ganancia_neta || 0),
    tarifa_entrega: Number(pedido?.tarifa_entrega || pedido?.costo_envio || 0)
  };

  const consistency = {
    estado_final: estadoFinal,
    residuales_limpios: residuals.pedidos_para_reparto === 0 && residuals.pedidos_en_camino === 0 && residuals.pedido_activo === 0,
    finanzas_sanas: financial.deuda_actual <= financial.limite_deuda,
    ganancia_registrada: financial.ganancia_neta_pedido > 0,
    pedido_coincide_driver: String(pedido?.conductorId || pedido?.repartidor_id || '') === driverUid
  };

  const baselineFinancial = baseline.financial || {};
  const baselineResiduals = baseline.residuals || {};
  const baselineConsistency = baseline.consistency || {};
  const comparative = {
    pedido_id: baseline.pedidoId ? pedidoId === baseline.pedidoId : true,
    driver_uid: baseline.driverUid ? driverUid === baseline.driverUid : true,
    estado_final: baselineConsistency.estado_final ? estadoFinal === baselineConsistency.estado_final : true,
    residuales: baselineResiduals.pedidos_para_reparto === 0 && baselineResiduals.pedidos_en_camino === 0 && baselineResiduals.pedido_activo === 0
      ? consistency.residuales_limpios
      : true,
    ganancia_neta_pedido: baselineFinancial.ganancia_neta_pedido != null
      ? financial.ganancia_neta_pedido === Number(baselineFinancial.ganancia_neta_pedido)
      : true,
    tarifa_entrega: baselineFinancial.tarifa_entrega != null
      ? financial.tarifa_entrega === Number(baselineFinancial.tarifa_entrega)
      : true,
    saldo_ganancias_minimo: baselineFinancial.saldo_ganancias_minimo != null
      ? financial.saldo_ganancias >= Number(baselineFinancial.saldo_ganancias_minimo)
      : true,
    deuda_actual_maxima: baselineFinancial.deuda_actual_maxima != null
      ? financial.deuda_actual <= Number(baselineFinancial.deuda_actual_maxima)
      : true,
    limite_deuda: baselineFinancial.limite_deuda != null
      ? financial.limite_deuda === Number(baselineFinancial.limite_deuda)
      : true
  };

  const beforeSaldo = baselineFinancial.saldo_ganancias_before != null
    ? Number(baselineFinancial.saldo_ganancias_before)
    : null;
  const afterSaldo = baselineFinancial.saldo_ganancias_after != null
    ? Number(baselineFinancial.saldo_ganancias_after)
    : financial.saldo_ganancias;
  const deltaSaldo = beforeSaldo != null ? roundMoney(afterSaldo - beforeSaldo) : null;
  const expectedDeltaSaldo = baselineFinancial.delta_saldo_ganancias != null
    ? Number(baselineFinancial.delta_saldo_ganancias)
    : (baselineFinancial.ganancia_neta_pedido != null ? Number(baselineFinancial.ganancia_neta_pedido) : null);
  const financialDelta = {
    saldo_ganancias_before: beforeSaldo,
    saldo_ganancias_after: afterSaldo,
    delta_saldo_ganancias: deltaSaldo,
    coincide_ganancia_neta: deltaSaldo != null && expectedDeltaSaldo != null
      ? deltaSaldo === expectedDeltaSaldo
      : true
  };

  const ok =
    metricas.pedido_creado === 1 &&
    metricas.pedido_publicado === 1 &&
    metricas.pedido_aceptado === 1 &&
    metricas.pedido_entregado === 1 &&
    residuals.pedidos_para_reparto === 0 &&
    residuals.pedidos_en_camino === 0 &&
    residuals.pedido_activo === 0 &&
    consistency.finanzas_sanas &&
    consistency.ganancia_registrada &&
    consistency.pedido_coincide_driver &&
    comparative.pedido_id &&
    comparative.driver_uid &&
    comparative.estado_final &&
    comparative.residuales &&
    comparative.ganancia_neta_pedido &&
    comparative.tarifa_entrega &&
    comparative.saldo_ganancias_minimo &&
    comparative.deuda_actual_maxima &&
    comparative.limite_deuda &&
    financialDelta.coincide_ganancia_neta;

  const report = {
    ok,
    pedidoId,
    driverUid,
    metricas,
    residuals,
    financial,
    consistency,
    comparative,
    financialDelta,
    baseline: {
      pedidoId: baseline.pedidoId,
      driverUid: baseline.driverUid,
      financial: baseline.financial,
      residuals: baseline.residuals,
      consistency: baseline.consistency
    },
    snapshot: {
      estadoFinal,
      pedidosParaReparto: Boolean(pedidosParaReparto),
      pedidosEnCamino: Boolean(pedidosEnCamino),
      pedidoActivo
    }
  };

  console.log(JSON.stringify(report, null, 2));
  await admin.app().delete();

  if (!ok) {
    process.exit(1);
  }
}

main().catch(async (error) => {
  console.error(JSON.stringify({
    ok: false,
    error: error.message,
    timestamp: new Date().toISOString()
  }, null, 2));
  if (admin.apps.length) await admin.app().delete();
  process.exit(1);
});
