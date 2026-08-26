const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ORDER_ID = process.env.ORDER_ID || process.argv[2] || null;
const DRIVER_UID = process.env.DRIVER_UID || process.argv[3] || null;
const DATABASE_URL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

function normalizePrivateKey(privateKey) {
  return String(privateKey || '').replace(/\\n/g, '\n');
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
    const serviceAccount = raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    if (serviceAccount.private_key) {
      serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
    }
    return serviceAccount;
  }

  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    const serviceAccount = raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
    if (serviceAccount.private_key) {
      serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
    }
    return serviceAccount;
  }

  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    const serviceAccount = JSON.parse(fs.readFileSync(localPath, 'utf8'));
    if (serviceAccount.private_key) {
      serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
    }
    return serviceAccount;
  }

  throw new Error('No se encontro credencial Firebase Admin');
}

function firstText(...values) {
  return values.map((value) => String(value || '').trim()).find(Boolean) || null;
}

function summarizeOrder(id, value) {
  if (!value || typeof value !== 'object') return null;
  return {
    id,
    folio: firstText(value.shortId, value.short_id, value.folio, value.folio_operativo),
    estado: firstText(value.estado, value.estado_pedido),
    cliente: firstText(value.cliente, value.cliente_nombre, value.nombre_cliente, value.nombre),
    comercio: firstText(value.comercio, value.comercio_nombre, value.nombre_comercial, value.comercio_id),
    conductorId: firstText(value.conductorId, value.repartidor_id, value.idConductor, value.driver_uid),
    fecha: value.fecha || value.createdAt || value.created_at || value.timestamp || null
  };
}

function isCleanResidual(value) {
  return value == null || value === false || (typeof value === 'object' && Object.keys(value).length === 0);
}

async function readTopRecentOrders(db, node, limit = 5) {
  const snap = await db.ref(node).orderByChild('fecha').limitToLast(limit).once('value');
  const value = snap.val() || {};
  return Object.entries(value)
    .map(([id, item]) => summarizeOrder(id, item))
    .filter(Boolean)
    .sort((a, b) => String(b.fecha || '').localeCompare(String(a.fecha || '')));
}

async function inspectOrder(db, orderId) {
  const [pedidoSnap, repartoSnap, caminoSnap, activoDriversSnap] = await Promise.all([
    db.ref(`pedidos/${orderId}`).once('value'),
    db.ref(`pedidos_para_reparto/${orderId}`).once('value'),
    db.ref(`pedidos_en_camino/${orderId}`).once('value'),
    db.ref('repartidores').once('value')
  ]);

  const drivers = activoDriversSnap.val() || {};
  const driversConPedidoActivo = Object.entries(drivers)
    .filter(([, value]) => String(value?.pedido_activo || '').trim() === orderId)
    .map(([uid, value]) => ({
      uid,
      estado: firstText(value?.estado, value?.status),
      nombre: firstText(value?.nombre, value?.displayName)
    }));

  const pedido = pedidoSnap.val() || null;
  const reparto = repartoSnap.exists() ? repartoSnap.val() : null;
  const camino = caminoSnap.exists() ? caminoSnap.val() : null;

  return {
    orderId,
    pedido: summarizeOrder(orderId, pedido),
    nodes: {
      pedidos: Boolean(pedidoSnap.exists()),
      pedidos_para_reparto: !isCleanResidual(reparto),
      pedidos_en_camino: !isCleanResidual(camino),
      driversConPedidoActivo
    },
    residuals: {
      pedidos_para_reparto: reparto,
      pedidos_en_camino: camino,
      pedido_activo_driver: driversConPedidoActivo
    },
    limpio: !pedidoSnap.exists() && !repartoSnap.exists() && !caminoSnap.exists() && driversConPedidoActivo.length === 0
  };
}

async function inspectDriver(db, driverUid) {
  const snap = await db.ref(`repartidores/${driverUid}/pedido_activo`).once('value');
  return {
    driverUid,
    pedido_activo: snap.exists() ? snap.val() : null,
    limpio: snap.val() == null
  };
}

async function main() {
  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: DATABASE_URL
    });
  }

  const db = admin.database();

  const report = {
    scope: {
      orderId: ORDER_ID,
      driverUid: DRIVER_UID
    },
    recent: {
      pedidos: await readTopRecentOrders(db, 'pedidos', 5),
      pedidos_para_reparto: await readTopRecentOrders(db, 'pedidos_para_reparto', 5),
      pedidos_en_camino: await readTopRecentOrders(db, 'pedidos_en_camino', 5)
    }
  };

  if (ORDER_ID) {
    report.inspect = await inspectOrder(db, ORDER_ID);
    if (!DRIVER_UID && report.inspect?.pedido?.conductorId) {
      report.scope.driverUid = report.inspect.pedido.conductorId;
    }
  }

  if (report.scope.driverUid) {
    report.driver = await inspectDriver(db, report.scope.driverUid);
  }

  report.cleanHints = {
    pedidos_para_reparto: report.inspect ? isCleanResidual(report.inspect.residuals.pedidos_para_reparto) : null,
    pedidos_en_camino: report.inspect ? isCleanResidual(report.inspect.residuals.pedidos_en_camino) : null,
    pedido_activo: report.driver ? report.driver.limpio : null,
    cleanup_residuals_ok:
      (report.inspect ? isCleanResidual(report.inspect.residuals.pedidos_para_reparto) : true) &&
      (report.inspect ? isCleanResidual(report.inspect.residuals.pedidos_en_camino) : true) &&
      (report.driver ? report.driver.limpio : true)
  };

  report.summary = {
    pedido_entregado: String(report.inspect?.pedido?.estado || '').toUpperCase() === 'ENTREGADO',
    cleanup_residuals_ok: report.cleanHints.cleanup_residuals_ok,
    historial_presente_en_pedidos: Boolean(report.inspect?.nodes?.pedidos),
    nota: 'Se considera correcto que el pedido siga existiendo en /pedidos como historial; solo se auditan los residuos operativos.'
  };

  console.log(JSON.stringify(report, null, 2));
  await admin.app().delete();
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
