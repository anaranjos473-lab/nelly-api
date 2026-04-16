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

  const pedidoId = `test_${Date.now()}`;
  const pedido = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'Cliente Prueba',
    descripcion: 'Hamburguesa + papas (prueba automatica)',
    monto: 129.0,
    estado: 'pendiente',
    timestamp: Date.now(),
  };

  await admin.database().ref(`pedidos/${pedidoId}`).set(pedido);

  console.log('Pedido de prueba creado en RTDB.');
  console.log(`Nodo: pedidos/${pedidoId}`);
  console.log('Abre el panel web y presiona LISTO PARA REPARTO para validar el flujo completo.');
}

main().catch((error) => {
  console.error('Error creando pedido de prueba:', error.message);
  process.exit(1);
});
