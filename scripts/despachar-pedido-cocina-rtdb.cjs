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

function numeroSeguro(valor) {
  const n = Number(valor);
  return Number.isFinite(n) ? n : null;
}

function limpiarPedido(pedido) {
  const limpio = { ...pedido };
  delete limpio.__source;
  delete limpio.__legacyPath;
  delete limpio._rtdbKey;
  return limpio;
}

function construirPayloadReparto(pedido, datos) {
  const clienteNombre = pedido.cliente_nombre || pedido.cliente || 'Usuario Nelly';
  const lat = numeroSeguro(pedido.cliente_lat ?? pedido.lat_cliente ?? pedido.lat ?? pedido.latitude);
  const lng = numeroSeguro(pedido.cliente_lng ?? pedido.lng_cliente ?? pedido.lng ?? pedido.longitude ?? pedido.lon);
  const tiempoEstimado = String(pedido.tiempo_estimado || '25 min');

  return {
    ...datos,
    id: pedido.id,
    id_pedido: pedido.id,
    pedido_id: pedido.id,
    estado: 'LISTO',
    hora_cocina: new Date().toISOString(),
    fuente_origen: pedido.__source,
    fase_panel: 'Despacho',
    cliente: {
      nombre: clienteNombre,
      coords: {
        lat,
        lng
      }
    },
    logistica: {
      estado: 'disponible',
      repartidor_id: null,
      tiempo_estimado: tiempoEstimado
    }
  };
}

async function main() {
  const pedidoId = process.argv[2];
  if (!pedidoId) {
    console.error('Uso: node scripts/despachar-pedido-cocina-rtdb.cjs <pedidoId>');
    process.exit(1);
  }

  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });

  const db = admin.database();
  const pedidoSnap = await db.ref(`pedidos/${pedidoId}`).once('value');
  if (!pedidoSnap.exists()) {
    throw new Error(`Pedido no encontrado en pedidos/${pedidoId}`);
  }

  const pedido = {
    ...pedidoSnap.val(),
    id: pedidoId,
    _rtdbKey: pedidoId,
    __source: 'rtdb',
  };
  const payloadReparto = construirPayloadReparto(pedido, limpiarPedido(pedido));
  await db.ref().update({
    [`pedidos_para_reparto/${pedidoId}`]: payloadReparto,
    [`pedidos_en_camino/${pedidoId}`]: payloadReparto,
    [`pedidos/${pedidoId}/estado`]: 'listo',
  });

  console.log(JSON.stringify({
    ok: true,
    pedidoId,
    escritos: [
      `pedidos_para_reparto/${pedidoId}`,
      `pedidos_en_camino/${pedidoId}`,
      `pedidos/${pedidoId}/estado`
    ],
    summary: {
      estado: payloadReparto.estado,
      estado_pedido: payloadReparto.estado_pedido || null,
      conductorId: payloadReparto.conductorId || null,
      idConductor: payloadReparto.idConductor || null,
      repartidor_id: payloadReparto.repartidor_id || null,
      logistica_repartidor_id: payloadReparto.logistica?.repartidor_id || null
    }
  }, null, 2));
  process.exit(0);
}

main().catch((error) => {
  console.error('Error despachando pedido:', error.message);
  process.exit(1);
});
