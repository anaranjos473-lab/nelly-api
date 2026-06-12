const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  const localPath = './nelly-admin.json';
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }

  throw new Error('No se encontro credencial Firebase Admin (FIREBASE_ADMIN_JSON o nelly-admin.json).');
}

async function main() {
  const pedidoId = process.argv[2];
  if (!pedidoId) {
    console.error('Uso: node scripts/inspeccionar-pedido-rtdb.cjs <pedidoId>');
    console.error('Ejemplo: node scripts/inspeccionar-pedido-rtdb.cjs AUTO_1776542570508');
    process.exit(1);
  }

  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });

  const db = admin.database();
  const nodes = [
    'pedidos',
    'pedidos_para_reparto',
    'pedidos_en_camino',
  ];

  const result = {};
  for (const node of nodes) {
    const path = `${node}/${pedidoId}`;
    const snap = await db.ref(path).once('value');
    result[node] = snap.exists() ? snap.val() : null;
  }

  function summaryFields(nodeData) {
    if (!nodeData || typeof nodeData !== 'object') return null;
    return {
      id: nodeData.id || nodeData.id_pedido || nodeData.pedido_id || null,
      estado: nodeData.estado || null,
      estado_pedido: nodeData.estado_pedido || null,
      conductorId: nodeData.conductorId || null,
      idConductor: nodeData.idConductor || null,
      repartidor_id: nodeData.repartidor_id || null,
      logistica_repartidor_id: nodeData.logistica?.repartidor_id || null,
      logistica_estado: nodeData.logistica?.estado || null,
      cliente_nombre: nodeData.cliente_nombre || nodeData.cliente?.nombre || nodeData.cliente || null,
      monto: nodeData.monto || nodeData.total || null,
      hora_cocina: nodeData.hora_cocina || null,
      aceptado_en: nodeData.aceptado_en || null,
      entregado_en: nodeData.entregado_en || null
    };
  }

  function buildSummary() {
    return nodes.reduce((summary, node) => {
      const fields = summaryFields(result[node]);
      summary[node] = {
        exists: result[node] !== null,
        estado: fields?.estado || null,
        estado_pedido: fields?.estado_pedido || null,
        conductorId: fields?.conductorId || null,
        idConductor: fields?.idConductor || null,
        repartidor_id: fields?.repartidor_id || null,
        logistica_repartidor_id: fields?.logistica_repartidor_id || null,
        fields
      };
      return summary;
    }, {});
  }

  const output = {
    pedidoId,
    summary: buildSummary(),
    result
  };

  console.log(JSON.stringify(output, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error('Error inspeccionando RTDB:', error.message);
  process.exit(1);
});
