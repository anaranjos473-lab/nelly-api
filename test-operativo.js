import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

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

  // Crear pedido para conductor_prueba_001 (que tiene FCM activo)
  const pedidoId = `TEST_OPERATIVO_${Date.now()}`;
  const payload = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'DJ Sinchoque - Test Operativo',
    descripcion: 'Validación ciclo completo operativo',
    monto: 175.0,
    estado: 'esperando_repartidor',
    hora_cocina: new Date().toISOString(),
    fuente_origen: 'script_operativo',
    timestamp: Date.now(),
  };

  await db.ref(`pedidos_para_reparto/${pedidoId}`).set(payload);

  console.log('\n✅ PEDIDO OPERATIVO CREADO:\n');
  console.log(`   ID: ${pedidoId}`);
  console.log(`   Cliente: ${payload.cliente_nombre}`);
  console.log(`   Monto: $${payload.monto}`);
  console.log(`   Para: conductor_prueba_001`);
  console.log(`\n📱 Verifica en la app de Android (debería llegar notificación + audio)\n`);
}

main().catch((error) => {
  console.error('Error:', error.message);
  process.exit(1);
});
