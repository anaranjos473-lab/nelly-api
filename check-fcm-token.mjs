import admin from 'firebase-admin';
import fs from 'fs';

const raw = process.env.FIREBASE_ADMIN_JSON || fs.readFileSync('nelly-admin.json', 'utf8');
const serviceAccount = raw.trim().startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
  });
}

const db = admin.database();
const uid = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';

const token1 = await db.ref(`repartidores/${uid}/fcm_token`).once('value');
const token2 = await db.ref(`repartidores_activos/${uid}/fcm_token`).once('value');

console.log('🔔 FCM TOKEN VERIFICATION:');
console.log('repartidores:', token1.val() ? '✅ SYNCED (' + token1.val().substring(0, 30) + '...)' : '❌ MISSING');
console.log('repartidores_activos:', token2.val() ? '✅ SYNCED (' + token2.val().substring(0, 30) + '...)' : '❌ MISSING');
process.exit(0);
