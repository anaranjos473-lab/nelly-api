const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return require(localPath);
  }
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
  const password = process.env.DRIVER_TEST_PASSWORD;
  const displayName = process.env.DRIVER_TEST_NAME || 'Driver Tuxtla 001';

  if (!password) {
    throw new Error('DRIVER_TEST_PASSWORD es requerido');
  }

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  // Prueba con diferentes formatos de email
  const emailOptions = [
    'drivertuxtla@nelly.com',
    'driver-tuxtla-001@nelly.com',
    'tuxtla@nelly.com'
  ];

  for (const email of emailOptions) {
    try {
      console.log(`\n⏳ Intentando con email: ${email}`);
      
      let userRecord;
      try {
        userRecord = await admin.auth().getUserByEmail(email);
        console.log(`   ⚠️  Usuario ya existe con UID: ${userRecord.uid}`);
        continue; // Probar siguiente email
      } catch (err) {
        if (err.code === 'auth/user-not-found') {
          userRecord = await admin.auth().createUser({
            email,
            password,
            displayName,
            emailVerified: false
          });
          console.log(`   ✅ Usuario creado exitosamente`);
        } else {
          throw err;
        }
      }

      const uid = userRecord.uid;
      const db = admin.database();
      const now = Date.now();

      const profile = {
        uid,
        email,
        nombre: displayName,
        activo: true,
        estado: 'disponible'
      };

      await db.ref(`repartidores/${uid}`).set(profile);
      await db.ref(`repartidores_activos/${uid}`).set({
        uid,
        estado: 'DISPONIBLE',
        actualizado: now
      });

      console.log(`\n🎯 Usuario listo para login:`);
      console.log(`   Email: ${email}`);
      console.log(`   Contraseña: definida en DRIVER_TEST_PASSWORD`);
      console.log(`   UID: ${uid}`);
      
      process.exit(0);
    } catch (error) {
      console.error(`   ❌ Error: ${error.message}`);
    }
  }

  console.error('\n❌ No se pudo crear ningún usuario');
  process.exit(1);
}

main();
