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
  const auth = admin.auth();

  console.log('\n=== BUSCAR UID POR EMAIL ===\n');

  try {
    // Buscar UID por email
    const userRecord = await auth.getUserByEmail('drivertuxtla@nelly.com');
    const driverUid = userRecord.uid;
    
    console.log(`✅ UID encontrado: ${driverUid}`);
    console.log(`   Email: ${userRecord.email}`);
    console.log(`   Creado: ${new Date(userRecord.metadata.creationTime).toLocaleString('es-MX')}`);
    
    // Verificar su estado en repartidores
    console.log(`\n=== ESTADO EN FIREBASE ===\n`);
    
    const repartidorSnap = await db.ref(`repartidores/${driverUid}`).once('value');
    const repartidor = repartidorSnap.val() || {};
    
    console.log(`Nodo repartidores/${driverUid}:`);
    console.log(`  - Estado: ${repartidor.estado || 'N/A'}`);
    console.log(`  - FCM: ${repartidor.fcm_token ? '✅ SINCRONIZADO' : '❌ FALTA'}`);
    console.log(`  - Ubicación: ${repartidor.lat && repartidor.lng ? `(${repartidor.lat.toFixed(4)}, ${repartidor.lng.toFixed(4)})` : 'N/A'}`);
    
    console.log(`\n🔑 TU UID: ${driverUid}`);
    console.log(`\n⚠️ SI NO VES CAMPO "FCM: ✅", el token no está sincronizado.`);
    console.log(`   Necesitamos forzar la sincronización desde la app.\n`);
    
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    console.log(`\n   Posible causa: El email no existe o Firebase Auth está con problemas.`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
