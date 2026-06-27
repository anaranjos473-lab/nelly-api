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
  const driverUid = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';

  // CREAR EN pedidos_para_reparto (donde el driver LO VE)
  const pedidoId = `FINAL_CICLO_${Date.now()}`;
  const payload = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'DJ Sinchoque - FINAL',
    descripcion: 'Ciclo completo E2E',
    monto: 250.0,
    estado: 'disponible',
    repartidor_id: null,
    timestamp: Date.now(),
    fuente_origen: 'script_final'
  };

  try {
    await db.ref(`pedidos_para_reparto/${pedidoId}`).set(payload);

    console.log('\n✅ PEDIDO CREADO EN pedidos_para_reparto:\n');
    console.log(`   ID: ${pedidoId}`);
    console.log(`   Cliente: ${payload.cliente_nombre}`);
    console.log(`   Monto: $${payload.monto}`);
    console.log(`   Estado: DISPONIBLE (listo para aceptar)`);
    console.log(`\n📱 EL DRIVER DEBERÍA VERLO EN "PEDIDOS DISPONIBLES"\n`);
    console.log(`   Pasos:\n   1. Abre app en teléfono\n   2. Ve a "Pedidos Disponibles"\n   3. Verás: "DJ Sinchoque - FINAL - $250"\n   4. Pulsa ACEPTAR\n   5. Se va a EN_CAMINO\n   6. Pulsa ENTREGA COMPLETADA en panel\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
