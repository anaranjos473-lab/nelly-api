const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const UID = process.env.DRIVER_UID || '8mo8182LJsgV7vKMSpiCekFKAG23';

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
  const ref = db.ref(`repartidores/${UID}`);
  const snap = await ref.once('value');
  const current = snap.val() || {};
  const now = Date.now();

  const updates = {
    [`repartidores/${UID}/estatus/bloqueado_por_deuda`]: false,
    [`repartidores/${UID}/perfil/bloqueado_por_deuda`]: false,
    [`repartidores/${UID}/finanzas/deuda_actual`]: 0,
    [`repartidores/${UID}/finanzas/limite_deuda`]: Number(current?.finanzas?.limite_deuda || 300),
    [`repartidores/${UID}/billetera/deuda_comision`]: 0,
    [`repartidores/${UID}/estatus/actualizado_en`]: now,
    [`repartidores/${UID}/perfil/actualizado_en`]: now
  };

  await db.ref().update(updates);

  const refreshed = (await ref.once('value')).val() || {};
  console.log(JSON.stringify({
    ok: true,
    uid: UID,
    deudaActual: Number(refreshed?.finanzas?.deuda_actual || refreshed?.billetera?.deuda_comision || 0),
    limiteDeuda: Number(refreshed?.finanzas?.limite_deuda || 0),
    bloqueadoPorDeuda: Boolean(refreshed?.estatus?.bloqueado_por_deuda || refreshed?.perfil?.bloqueado_por_deuda)
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
