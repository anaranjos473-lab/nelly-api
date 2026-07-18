const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
const CASE_ID = 'ICV-01';
const ORDER_IDS = [
  'PED_1784065652654',
  'PED_1784126354806',
  'PED_1784135980270',
  'PED_1784138391476',
  'PED_1784144699044',
];

function loadServiceAccount() {
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  return JSON.parse(fs.readFileSync('nelly-admin.json', 'utf8'));
}

function summarizePedido(pedidoId, pedido) {
  if (!pedido) return { pedidoId, exists: false };
  return {
    pedidoId,
    exists: true,
    estado: pedido.estado ?? null,
    estado_pedido: pedido.estado_pedido ?? null,
    logistica_estado: pedido.logistica?.estado ?? null,
    conductorId: pedido.conductorId ?? null,
    idConductor: pedido.idConductor ?? null,
    repartidor_id: pedido.repartidor_id ?? null,
    finalizado_at: pedido.finalizado_at ?? null,
    entregado_en: pedido.entregado_en ?? null,
    evidencia_url: pedido.evidencia_url ?? null,
    timestamp: pedido.timestamp ?? pedido.fecha ?? pedido.createdAt ?? null,
  };
}

async function main() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(loadServiceAccount()),
      databaseURL: DATABASE_URL,
    });
  }

  const db = admin.database();
  const backupAt = Date.now();
  const archiveRoot = `pedidos_archivados/${CASE_ID}`;

  const snapshots = {};
  for (const pedidoId of ORDER_IDS) {
    const [pedidoSnap, repartoSnap, caminoSnap] = await Promise.all([
      db.ref(`pedidos/${pedidoId}`).once('value'),
      db.ref(`pedidos_para_reparto/${pedidoId}`).once('value'),
      db.ref(`pedidos_en_camino/${pedidoId}`).once('value'),
    ]);

    snapshots[pedidoId] = {
      pedidos: summarizePedido(pedidoId, pedidoSnap.val()),
      pedidos_para_reparto: summarizePedido(pedidoId, repartoSnap.val()),
      pedidos_en_camino: summarizePedido(pedidoId, caminoSnap.val()),
    };
  }

  const archivePayload = {
    caseId: CASE_ID,
    archivedAt: backupAt,
    reason: 'normalizacion_administrativa_icv01',
    orders: snapshots,
  };

  await db.ref(`${archiveRoot}/metadata`).set({
    caseId: CASE_ID,
    archivedAt: backupAt,
    source: 'scripts/normalizar-icv-01.cjs',
    orderCount: ORDER_IDS.length,
  });

  for (const pedidoId of ORDER_IDS) {
    await db.ref(`${archiveRoot}/${pedidoId}`).set({
      caseId: CASE_ID,
      pedidoId,
      archivedAt: backupAt,
      reason: 'normalizacion_administrativa_icv01',
      snapshot: snapshots[pedidoId],
    });
  }

  const removals = {};
  for (const pedidoId of ORDER_IDS) {
    removals[`pedidos/${pedidoId}`] = null;
    removals[`pedidos_para_reparto/${pedidoId}`] = null;
    removals[`pedidos_en_camino/${pedidoId}`] = null;
    removals[`pedidos_activos/${pedidoId}`] = null;
  }

  await db.ref().update(removals);

  console.log(JSON.stringify({
    ok: true,
    caseId: CASE_ID,
    archivedAt: backupAt,
    archiveRoot,
    orderCount: ORDER_IDS.length,
    archivePreview: archivePayload,
  }, null, 2));

  await admin.app().delete();
}

main().catch(async (error) => {
  console.error(JSON.stringify({ ok: false, error: error.message }, null, 2));
  if (admin.apps.length) await admin.app().delete();
  process.exit(1);
});
