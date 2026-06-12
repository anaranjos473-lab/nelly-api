import path from 'path';
import fs from 'fs';
import admin from 'firebase-admin';
import 'dotenv/config';

function loadServiceAccount() {
  const secretPath = '/etc/secrets/nelly-admin.json';
  const localPath = path.join(process.cwd(), 'nelly-admin.json');

  if (fs.existsSync(secretPath)) {
    return JSON.parse(fs.readFileSync(secretPath, 'utf8'));
  }

  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
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

  const pedidoId = `PED_${Date.now()}`;
  const pedido = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'Cliente Validacion Flujo',
    telefono: '9610000000',
    direccion: 'Validacion operativa Nelly',
    descripcion: 'Pedido real de validacion Admin-Cocina-Driver',
    monto: 129.0,
    estado: 'pendiente',
    repartidor_id: null,
    fecha_creacion: Date.now(),
    origen: 'panel_admin',
  };

  await admin.database().ref(`pedidos/${pedidoId}`).set(pedido);

  console.log('Pedido de validacion creado en RTDB.');
  console.log(`Nodo: pedidos/${pedidoId}`);
  console.log(`ID: ${pedidoId}`);
  console.log('Abre Cocina y presiona DESPACHAR para validar el flujo completo.');
  process.exit(0);
}

main().catch((error) => {
  console.error('Error creando pedido de prueba:', error.message);
  process.exit(1);
});
