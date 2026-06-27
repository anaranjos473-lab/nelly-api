import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function parseArgs(argv) {
  const args = { dryRun: false, prefixes: [] };
  for (let i = 0; i < argv.length; i += 1) {
    const value = argv[i];
    if (value === '--dry-run') {
      args.dryRun = true;
    } else if (value === '--prefixes') {
      args.prefixes = String(argv[i + 1] || '').split(',').map((item) => item.trim()).filter(Boolean);
      i += 1;
    }
  }
  return args;
}

function loadServiceAccount() {
  const secretPath = '/etc/secrets/nelly-admin.json';
  const localPath = path.join(process.cwd(), 'nelly-admin.json');

  if (fs.existsSync(secretPath)) {
    return JSON.parse(fs.readFileSync(secretPath, 'utf-8'));
  }

  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
  }

  throw new Error('No se encontro credencial Firebase Admin');
}

function matchesAnyPrefix(id, prefixes) {
  if (!id) return false;
  return prefixes.some((prefix) => String(id).startsWith(prefix));
}

function getEstadoPedido(pedido = {}) {
  return String(pedido.estado || pedido.estado_pedido || '').trim().toUpperCase();
}

function hasActiveAssignment(pedido = {}) {
  return Boolean(
    pedido.repartidor_id
    || pedido.repartidorId
    || pedido.conductorId
    || pedido.driverUid
    || pedido.repartidor_uid
    || pedido.uid_repartidor
  );
}

function hasPendingFinancialSignal(pedido = {}) {
  const finanzas = pedido.finanzas || {};
  return Boolean(
    finanzas?.pendiente
    || finanzas?.deuda_pendiente
    || finanzas?.deudaPendiente
    || finanzas?.movimiento_pendiente
    || finanzas?.movimientoPendiente
    || finanzas?.bloqueado_por_deuda
    || finanzas?.bloqueadoPorDeuda
    || pedido?.estado_finanzas === 'PENDIENTE'
    || pedido?.estado_financiero === 'PENDIENTE'
  );
}

async function main() {
  const { dryRun, prefixes: cliPrefixes } = parseArgs(process.argv.slice(2));
  const prefixes = cliPrefixes.length > 0
    ? cliPrefixes
    : (process.env.TEST_ORDER_PREFIXES || 'ANDROID_TEST_,VALIDACION_G3_,TEST_,PED_TEST_,CICLO_REPETIBLE_').split(',').map((item) => item.trim()).filter(Boolean);

  if (prefixes.length === 0) {
    throw new Error('No hay prefijos de pedidos de prueba definidos');
  }

  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });
  }

  const db = admin.database();
  const nodes = ['pedidos', 'pedidos_para_reparto', 'pedidos_en_camino', 'pedidos_activos'];
  const pedidoStates = new Map();
  const activeTransitions = new Set(['EN_CURSO', 'PEDIDO_ABORDO', 'LLEGUE_A_TIENDA', 'LLEGUE_A_CLIENTE']);
  const summary = { archive: 0, omit: 0, total: 0 };

  for (const node of nodes) {
    const snap = await db.ref(node).once('value');
    const items = snap.val() || {};
    Object.entries(items).forEach(([pedidoId, value]) => {
      if (!matchesAnyPrefix(pedidoId, prefixes)) {
        return;
      }

      const pedido = value || {};
      const estado = getEstadoPedido(pedido);
      const state = pedidoStates.get(pedidoId) || {
        pedidoId,
        sources: {},
        decision: 'archive',
        estado,
        repartidorId: pedido.repartidor_id || pedido.repartidorId || pedido.conductorId || pedido.driverUid || null,
        monto: pedido.monto_total || pedido.monto || pedido.total || null,
        archivoMotivo: 'Limpieza de certificación',
        fase: 'Pre Piloto B'
      };

      if (state.decision === 'omit') {
        return;
      }

      if (activeTransitions.has(estado)) {
        state.decision = 'omit';
        state.omitReason = 'transicion_activa';
        state.estado = estado;
        pedidoStates.set(pedidoId, state);
        return;
      }
      if (hasActiveAssignment(pedido)) {
        state.decision = 'omit';
        state.omitReason = 'repartidor_activo';
        state.estado = estado;
        pedidoStates.set(pedidoId, state);
        return;
      }
      if (hasPendingFinancialSignal(pedido)) {
        state.decision = 'omit';
        state.omitReason = 'finanzas_pendientes';
        state.estado = estado;
        pedidoStates.set(pedidoId, state);
        return;
      }

      state.sources[node] = value;
      state.estado = estado;
      state.repartidorId = state.repartidorId || pedido.repartidor_id || pedido.repartidorId || pedido.conductorId || pedido.driverUid || null;
      state.monto = state.monto || pedido.monto_total || pedido.monto || pedido.total || null;
      pedidoStates.set(pedidoId, state);
    });
  }

  const repartidoresSnap = await db.ref('repartidores').once('value');
  const repartidores = repartidoresSnap.val() || {};
  const activeRefs = [];
  Object.entries(repartidores).forEach(([uid, value]) => {
    const pedidoActivo = value?.pedido_activo;
    if (!pedidoActivo) {
      return;
    }
    if (matchesAnyPrefix(String(pedidoActivo), prefixes)) {
      activeRefs.push({ uid, pedidoActivo });
    }
  });

  const archiveCandidates = [...pedidoStates.values()]
    .filter((pedido) => pedido.decision !== 'omit')
    .sort((a, b) => a.pedidoId.localeCompare(b.pedidoId));
  const omittedCandidates = [...pedidoStates.values()]
    .filter((pedido) => pedido.decision === 'omit')
    .sort((a, b) => a.pedidoId.localeCompare(b.pedidoId));
  summary.total = archiveCandidates.length;
  summary.omit = omittedCandidates.length;
  console.log(`Se encontraron ${archiveCandidates.length} pedidos de prueba listos para archivar y ${omittedCandidates.length} pedidos omitidos por integridad.`);

  if (archiveCandidates.length === 0) {
    omittedCandidates.forEach((pedido) => {
      console.log(`OMITIR ${pedido.pedidoId} | estado=${pedido.estado || 'N/A'} | motivo=${pedido.omitReason || 'integridad'}`);
    });
    process.exit(0);
  }

  if (dryRun) {
    console.log('Modo dry-run: no se realizaron cambios.');
    archiveCandidates.forEach((pedido) => {
      console.log(`ARCHIVAR ${pedido.pedidoId} | estado=${pedido.estado || 'N/A'} | repartidor=${pedido.repartidorId || 'N/A'} | monto=${pedido.monto ?? 'N/A'}`);
    });
    omittedCandidates.forEach((pedido) => {
      console.log(`OMITIR ${pedido.pedidoId} | estado=${pedido.estado || 'N/A'} | motivo=${pedido.omitReason || 'integridad'}`);
    });
    console.log(`Resumen | archivar=${archiveCandidates.length} | omitir=${summary.omit} | eliminar_definitivo=0`);
    process.exit(0);
  }

  const archiveRoot = 'pedidos_archivados';
  const archivedAt = Date.now();

  for (const pedido of archiveCandidates) {
    const pedidoId = pedido.pedidoId;
    const payload = pedido;
    await db.ref(`${archiveRoot}/${pedidoId}`).set({
      ...payload,
      archivedAt,
      archivedReason: 'pedido_prueba_historico',
      motivo: 'Limpieza de certificación',
      fase: 'Pre Piloto B',
      archivado_por: 'limpiar-pedidos-prueba.js'
    });
    summary.archive += 1;
  }

  const removals = [];
  for (const pedido of archiveCandidates) {
    const pedidoId = pedido.pedidoId;
    removals.push(db.ref(`pedidos/${pedidoId}`).remove());
    removals.push(db.ref(`pedidos_para_reparto/${pedidoId}`).remove());
    removals.push(db.ref(`pedidos_en_camino/${pedidoId}`).remove());
    removals.push(db.ref(`pedidos_activos/${pedidoId}`).remove());
  }

  for (const ref of activeRefs) {
    removals.push(db.ref(`repartidores/${ref.uid}/pedido_activo`).remove());
  }

  await Promise.all(removals);

  console.log(`Resumen | archivar=${summary.archive} | omitir=${summary.omit} | eliminar_definitivo=0`);
  console.log(`Pedidos archivados en ${archiveRoot} y referencias activas limpiadas.`);
}

main().catch((error) => {
  console.error('ERROR_LIMPIEZA', error.message);
  process.exit(1);
});
