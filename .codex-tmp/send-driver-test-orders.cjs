const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return require(localPath);
  }
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

function buildPedidoPayload(id, estado, repartidorId = null) {
  const now = Date.now();
  return {
    id,
    id_pedido: id,
    cliente_nombre: 'Cliente Prueba Reparto',
    telefono: '+521234567890',
    direccion: 'Calle Test 123',
    colonia: 'Centro',
    monto: 149.0,
    total: 149.0,
    descripcion: 'Pedido de prueba para repartidor',
    estado,
    estado_pedido: estado,
    repartidor_id: repartidorId,
    conductorId: repartidorId,
    fuente_origen: 'script_prueba_repartidor',
    timestamp: now,
    actualizado_en: now,
    hora_cocina: new Date(now).toISOString()
  };
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  const db = admin.database();
  const driverUid = 'fE8uV6dke3XziYNhuO3kZU93xQj1';
  const ts = Date.now();

  const pedidoParaRepartoId = `test_para_reparto_${ts}`;
  const pedidoParaReparto = buildPedidoPayload(pedidoParaRepartoId, 'esperando_repartidor', null);

  const pedidoParaRepartoAsignadoId = `test_para_reparto_asg_${ts}`;
  const pedidoParaRepartoAsignado = buildPedidoPayload(pedidoParaRepartoAsignadoId, 'LISTO', driverUid);

  const pedidoEnCaminoAsignadoId = `test_en_camino_asg_${ts}`;
  const pedidoEnCaminoAsignado = buildPedidoPayload(pedidoEnCaminoAsignadoId, 'LISTO', driverUid);

  await Promise.all([
    db.ref(`pedidos_para_reparto/${pedidoParaRepartoId}`).set(pedidoParaReparto),
    db.ref(`pedidos_para_reparto/${pedidoParaRepartoAsignadoId}`).set(pedidoParaRepartoAsignado),
    db.ref(`pedidos_en_camino/${pedidoEnCaminoAsignadoId}`).set(pedidoEnCaminoAsignado)
  ]);

  console.log('Pedidos de prueba creados:');
  console.log(`- pedidos_para_reparto/${pedidoParaRepartoId} (esperando_repartidor)`);
  console.log(`- pedidos_para_reparto/${pedidoParaRepartoAsignadoId} (LISTO, repartidor_id=${driverUid})`);
  console.log(`- pedidos_en_camino/${pedidoEnCaminoAsignadoId} (LISTO, repartidor_id=${driverUid})`);
}

main().catch((error) => {
  console.error('Error creando pedidos de prueba:', error);
  process.exit(1);
});