import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const UIDS = (process.env.DRIVER_UIDS || 'ULILm4AyJGbfQzuUlC9ySpGrQrf1,iXXl1erAQxW0Hht0CLWzlOYGaAi1,9XPSCLkFUWeZnxWoFgZEf0uzkTe2')
  .split(',')
  .map((uid) => uid.trim())
  .filter(Boolean);

function loadServiceAccount() {
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
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
      databaseURL
    });
  }

  const db = admin.database();
  const now = Date.now();
  const updates = {};

  for (const uid of UIDS) {
    updates[`repartidores/${uid}/estatus/bloqueado_por_deuda`] = false;
    updates[`repartidores/${uid}/perfil/bloqueado_por_deuda`] = false;
    updates[`repartidores/${uid}/finanzas/deuda_actual`] = 0;
    updates[`repartidores/${uid}/finanzas/limite_deuda`] = 300;
    updates[`repartidores/${uid}/billetera/deuda_comision`] = 0;
    updates[`repartidores/${uid}/estatus/actualizado_en`] = now;
    updates[`repartidores/${uid}/perfil/actualizado_en`] = now;
  }

  await db.ref().update(updates);

  const checks = await Promise.all(UIDS.map(async (uid) => {
    const snap = await db.ref(`repartidores/${uid}`).once('value');
    const value = snap.val() || {};
    return {
      uid,
      deudaActual: Number(value?.finanzas?.deuda_actual || value?.billetera?.deuda_comision || 0),
      limiteDeuda: Number(value?.finanzas?.limite_deuda || 0),
      bloqueadoPorDeuda: Boolean(value?.estatus?.bloqueado_por_deuda || value?.perfil?.bloqueado_por_deuda)
    };
  }));

  console.log(JSON.stringify({ ok: true, updated: checks }, null, 2));

  await admin.app().delete();
}

main().catch(async (error) => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  if (admin.apps.length) {
    await admin.app().delete();
  }
  process.exit(1);
});
