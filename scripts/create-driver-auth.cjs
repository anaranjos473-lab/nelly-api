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

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  const email = process.env.DRIVER_TEST_EMAIL || 'driver_tuxtla_001@nelly.com';
  const password = process.env.DRIVER_TEST_PASSWORD;
  const displayName = process.env.DRIVER_TEST_NAME || 'Driver Tuxtla 001';

  if (!password) {
    throw new Error('DRIVER_TEST_PASSWORD es requerido');
  }

  try {
    console.log(`⏳ Creando usuario en Firebase Authentication...`);
    
    // 1. Verificar si el usuario existe
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(email);
      console.log(`⚠️  Usuario ya existe con UID: ${userRecord.uid}`);
    } catch (err) {
      if (err.code === 'auth/user-not-found') {
        // Crear el usuario
        userRecord = await admin.auth().createUser({
          email,
          password,
          displayName,
          emailVerified: false
        });
        console.log(`✅ Usuario creado exitosamente`);
        console.log(`   UID: ${userRecord.uid}`);
        console.log(`   Email: ${userRecord.email}`);
      } else {
        throw err;
      }
    }

    // 2. Crear o actualizar el perfil en RTDB
    const uid = userRecord.uid;
    const db = admin.database();
    const now = Date.now();

    const profile = {
      uid,
      email,
      nombre: displayName,
      activo: true,
      estado: 'disponible',
      creado: now,
      actualizado: now
    };

    await db.ref(`repartidores/${uid}`).set(profile);
    console.log(`✅ Perfil creado en RTDB`);
    console.log(`   Nodo: repartidores/${uid}`);

    // 3. Marcar como activo
    await db.ref(`repartidores_activos/${uid}`).set({
      uid,
      estado: 'DISPONIBLE',
      actualizado: now
    });
    console.log(`✅ Driver marcado como activo`);

    console.log(`\n🎯 Credenciales listas para el Motorola:`);
    console.log(`   Email: ${email}`);
    console.log(`   Contraseña: definida en DRIVER_TEST_PASSWORD`);
    console.log(`   UID: ${uid}`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

main();
