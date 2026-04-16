const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

function loadServiceAccount() {
  const secretPath = '/etc/secrets/nelly-admin.json';
  const localPath = path.join(process.cwd(), 'nelly-admin.json');

  if (fs.existsSync(secretPath)) {
    return require(secretPath);
  }

  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  if (fs.existsSync(localPath)) {
    return require(localPath);
  }

  throw new Error('No se encontro credencial Firebase Admin');
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

  const pedidoId = `reparto_${Date.now()}`;
  const payload = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'Cliente Prueba Reparto',
    descripcion: 'Pedido directo a cola de reparto',
    monto: 145.0,
    estado: 'esperando_repartidor',
    hora_cocina: new Date().toISOString(),
    fuente_origen: 'script_rtdb',
    timestamp: Date.now(),
  };

  await admin.database().ref(`pedidos_para_reparto/${pedidoId}`).set(payload);

  console.log('Pedido directo creado en RTDB para reparto.');
  console.log(`Nodo: pedidos_para_reparto/${pedidoId}`);
  console.log('Abre la app repartidor y valida audio + aparicion en Pedidos Disponibles.');
}

main().catch((error) => {
  console.error('Error creando pedido directo para reparto:', error.message);
  process.exit(1);
});
