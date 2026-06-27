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

  console.log('\n=== AUDITORÍA RÁPIDA ===\n');

  // 1. Verificar pedidos en pedidos_para_reparto
  console.log('📦 Pedidos en pedidos_para_reparto:');
  const repartoSnap = await db.ref('pedidos_para_reparto').once('value');
  const reparto = repartoSnap.val() || {};
  const repartoIds = Object.keys(reparto);
  console.log(`   Total: ${repartoIds.length}`);
  repartoIds.forEach(id => {
    const p = reparto[id];
    console.log(`   ✓ ${id}: ${p.cliente_nombre} - $${p.monto}`);
  });

  // 2. Verificar repartidores activos
  console.log('\n👥 Repartidores activos (nodo: repartidores):');
  const driverSnap = await db.ref('repartidores').once('value');
  const drivers = driverSnap.val() || {};
  const driverIds = Object.keys(drivers);
  console.log(`   Total: ${driverIds.length}`);
  driverIds.forEach(uid => {
    const d = drivers[uid];
    console.log(`   ✓ ${uid}`);
    console.log(`     - Online: ${d.estado || 'N/A'}`);
    console.log(`     - FCM: ${d.fcm_token ? '✅ (presente)' : '❌ (ausente)'}`);
    console.log(`     - Ubicación: ${d.lat && d.lng ? `(${d.lat.toFixed(4)}, ${d.lng.toFixed(4)})` : 'N/A'}`);
  });

  // 3. Verificar conductores_activos (alternativa)
  console.log('\n🔄 Conductores activos (nodo: conductores_activos):');
  const activeSnap = await db.ref('conductores_activos').once('value');
  const active = activeSnap.val() || {};
  const activeIds = Object.keys(active);
  console.log(`   Total: ${activeIds.length}`);
  activeIds.forEach(id => {
    const c = active[id];
    console.log(`   ✓ ${id}`);
    console.log(`     - Estado: ${c.estado || 'N/A'}`);
    console.log(`     - FCM: ${c.fcm_token ? '✅ (presente)' : '❌ (ausente)'}`);
  });

  console.log('\n=== FIN AUDITORÍA ===\n');
  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
