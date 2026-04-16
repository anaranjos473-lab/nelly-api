const fs = require('fs');
const admin = require('firebase-admin');
require('dotenv').config();

function loadServiceAccount() {
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  if (fs.existsSync('./nelly-admin.json')) {
    return JSON.parse(fs.readFileSync('./nelly-admin.json', 'utf8'));
  }

  throw new Error('No se encontro credencial Firebase Admin (FIREBASE_ADMIN_JSON o nelly-admin.json).');
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL,
  });

  await admin.auth().listUsers(1);
  console.log('firebase_admin_ok');
}

main().catch((error) => {
  console.error('firebase_admin_error:', error.message);
  process.exit(1);
});
