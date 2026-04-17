const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function parseServiceAccount() {
  const raw = process.env.FIREBASE_ADMIN_JSON;
  if (!raw) {
    throw new Error('FIREBASE_ADMIN_JSON no esta configurada');
  }

  try {
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (error) {
    throw new Error(`FIREBASE_ADMIN_JSON invalida: ${error.message}`);
  }
}

async function exportData() {
  try {
    const serviceAccount = parseServiceAccount();
    const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL
    });

    const snapshot = await admin.database().ref('/').once('value');
    const data = JSON.stringify(snapshot.val() || {}, null, 2);

    const date = new Date().toISOString().split('T')[0];
    const backupsDir = path.resolve('backups');
    const fileName = `backup-rtdb-${date}.json`;
    const filePath = path.join(backupsDir, fileName);

    if (!fs.existsSync(backupsDir)) {
      fs.mkdirSync(backupsDir, { recursive: true });
    }

    fs.writeFileSync(filePath, data, 'utf8');
    console.log(`OK Respaldo creado: backups/${fileName}`);
    process.exit(0);
  } catch (error) {
    console.error(`ERROR en respaldo: ${error.message}`);
    process.exit(1);
  }
}

exportData();
