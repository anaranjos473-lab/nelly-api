const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ORDER_ID = process.env.ORDER_ID || process.argv[2];

if (!ORDER_ID) {
  console.error('Uso: node scripts/inspect-order-readonly.cjs PED_XXXXXXXX');
  process.exit(1);
}

function normalizePrivateKey(privateKey) {
  return String(privateKey || '').replace(/\\n/g, '\n');
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
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
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }

  throw new Error('No se encontro credencial Firebase Admin');
}

function firstText(...values) {
  return values
    .map((value) => String(value || '').trim())
    .find(Boolean) || null;
}

function summarizeOrder(value) {
  if (!value || typeof value !== 'object') {
    return null;
  }

  return {
    id: firstText(value.id, value.id_pedido, value.pedido_id),
    folio: firstText(value.shortId, value.short_id, value.folio, value.folio_operativo),
    estado: firstText(value.estado, value.estado_pedido),
    cliente: firstText(value.cliente, value.cliente_nombre, value.nombre_cliente, value.nombre),
    comercio: firstText(value.comercio, value.comercio_nombre, value.nombre_comercial, value.comercio_id),
    fecha: value.fecha || value.createdAt || value.created_at || value.timestamp || null,
    repartidor: firstText(value.repartidor_id, value.idConductor, value.conductorId, value.driver_uid)
  };
}

function icon(exists) {
  return exists ? 'SI' : 'NO';
}

function diagnose({ pedidos, pedidosParaReparto, pedidosEnCamino, pedidoActivo }) {
  const estado = String(pedidos?.resumen?.estado || '').toUpperCase();

  if (!pedidos.exists && !pedidosParaReparto.exists && !pedidosEnCamino.exists && !pedidoActivo.length) {
    return 'NO ENCONTRADO';
  }
  if (pedidosEnCamino.exists || pedidoActivo.length) {
    return 'EN REPARTO / ASIGNADO A DRIVER';
  }
  if (pedidosParaReparto.exists) {
    return 'LISTO / PUBLICADO PARA RADAR';
  }
  if (estado === 'PENDIENTE' || estado === 'PREPARANDO') {
    return 'COCINA / AUN NO PUBLICADO A REPARTO';
  }
  if (estado === 'LISTO') {
    return 'LISTO EN PEDIDOS / SIN PROYECCION EN REPARTO';
  }
  if (estado === 'ENTREGADO' || estado === 'CANCELADO') {
    return 'CERRADO / NO DEBERIA APARECER COMO ACTIVO';
  }
  return estado ? `ESTADO ${estado}` : 'ESTADO NO DETERMINADO';
}

async function readOrderNode(db, node) {
  const snap = await db.ref(`${node}/${ORDER_ID}`).once('value');
  return {
    exists: snap.exists(),
    resumen: summarizeOrder(snap.val())
  };
}

async function findActiveDrivers(db) {
  const snap = await db.ref('repartidores').once('value');
  const repartidores = snap.val() || {};

  return Object.entries(repartidores)
    .filter(([, value]) => String(value?.pedido_activo || '').trim() === ORDER_ID)
    .map(([uid, value]) => ({
      uid,
      estado: firstText(value?.estado, value?.status),
      nombre: firstText(value?.nombre, value?.displayName)
    }));
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });
  }

  const db = admin.database();
  const [pedidos, pedidosParaReparto, pedidosEnCamino, pedidosActivos, pedidoActivo] = await Promise.all([
    readOrderNode(db, 'pedidos'),
    readOrderNode(db, 'pedidos_para_reparto'),
    readOrderNode(db, 'pedidos_en_camino'),
    readOrderNode(db, 'pedidos_activos'),
    findActiveDrivers(db)
  ]);

  const principal = pedidos.resumen
    || pedidosParaReparto.resumen
    || pedidosEnCamino.resumen
    || pedidosActivos.resumen
    || {};

  const payload = {
    pedidoId: ORDER_ID,
    folio: principal.folio || 'N/D',
    estado: principal.estado || 'N/D',
    cliente: principal.cliente || 'N/D',
    comercio: principal.comercio || 'N/D',
    ubicacion: {
      pedidos: pedidos.exists,
      pedidos_para_reparto: pedidosParaReparto.exists,
      pedidos_en_camino: pedidosEnCamino.exists,
      pedidos_activos: pedidosActivos.exists,
      pedido_activo_repartidor: pedidoActivo
    },
    diagnostico: diagnose({ pedidos, pedidosParaReparto, pedidosEnCamino, pedidoActivo })
  };

  console.log(`PEDIDO: ${payload.pedidoId}`);
  console.log(`FOLIO:  ${payload.folio}`);
  console.log(`ESTADO: ${payload.estado}`);
  console.log(`CLIENTE: ${payload.cliente}`);
  console.log(`COMERCIO: ${payload.comercio}`);
  console.log('');
  console.log(`pedidos:              ${icon(payload.ubicacion.pedidos)}`);
  console.log(`pedidos_para_reparto: ${icon(payload.ubicacion.pedidos_para_reparto)}`);
  console.log(`pedidos_en_camino:    ${icon(payload.ubicacion.pedidos_en_camino)}`);
  console.log(`pedidos_activos:      ${icon(payload.ubicacion.pedidos_activos)}`);
  console.log(`pedido_activo driver: ${payload.ubicacion.pedido_activo_repartidor.length ? 'SI' : 'NO'}`);
  if (payload.ubicacion.pedido_activo_repartidor.length) {
    console.log(`drivers: ${payload.ubicacion.pedido_activo_repartidor.map((driver) => driver.uid).join(', ')}`);
  }
  console.log('');
  console.log(`DIAGNOSTICO: ${payload.diagnostico}`);
  console.log('');
  console.log(JSON.stringify(payload, null, 2));

  await admin.app().delete();
}

main().catch(async (error) => {
  console.error(`ERROR: ${error.message}`);
  if (admin.apps.length) {
    await admin.app().delete();
  }
  process.exit(1);
});
