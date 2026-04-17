const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

function parseServiceAccountFromEnv() {
  const raw = process.env.FIREBASE_ADMIN_JSON;
  if (!raw) return null;

  try {
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  } catch (error) {
    throw new Error(`FIREBASE_ADMIN_JSON invalido: ${error.message}`);
  }
}

function parseServiceAccountFromFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el archivo de credenciales: ${absolutePath}`);
  }

  const content = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(content);
}

function getServiceAccount() {
  const fromEnv = parseServiceAccountFromEnv();
  if (fromEnv) return fromEnv;

  const fileArg = process.argv.find((arg) => arg.startsWith('--service-account='));
  if (fileArg) {
    return parseServiceAccountFromFile(fileArg.split('=')[1]);
  }

  const defaultPaths = [
    '/etc/secrets/nelly-admin.json',
    './nelly-admin.json',
    './serviceAccountKey.json'
  ];

  for (const candidate of defaultPaths) {
    try {
      return parseServiceAccountFromFile(candidate);
    } catch (_) {
      // Probar siguiente ruta.
    }
  }

  throw new Error(
    'No se encontraron credenciales. Usa FIREBASE_ADMIN_JSON o --service-account=RUTA_JSON'
  );
}

function parseUids() {
  const positional = process.argv
    .slice(2)
    .filter((arg) => !arg.startsWith('--'))
    .map((uid) => uid.trim())
    .filter(Boolean);

  if (positional.length > 0) return positional;

  const fromEnv = (process.env.DRIVER_UIDS || '')
    .split(',')
    .map((uid) => uid.trim())
    .filter(Boolean);

  return fromEnv;
}

async function asignarClaims(uids) {
  if (!uids.length) {
    throw new Error(
      'No se proporcionaron UIDs. Usa: node scripts/set-driver-claims.js UID1 UID2 o DRIVER_UIDS=uid1,uid2'
    );
  }

  let ok = 0;
  let fail = 0;

  for (const uid of uids) {
    try {
      await admin.auth().setCustomUserClaims(uid, {
        driver: true,
        role: 'repartidor'
      });
      console.log(`OK claims asignados al UID: ${uid}`);
      ok += 1;
    } catch (error) {
      console.error(`ERROR asignando claims al UID ${uid}: ${error.message}`);
      fail += 1;
    }
  }

  console.log(`Resumen => exitos: ${ok}, errores: ${fail}`);
  process.exit(fail > 0 ? 1 : 0);
}

async function main() {
  try {
    const serviceAccount = getServiceAccount();

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    const uids = parseUids();
    await asignarClaims(uids);
  } catch (error) {
    console.error(`Fallo set-driver-claims: ${error.message}`);
    process.exit(1);
  }
}

main();
