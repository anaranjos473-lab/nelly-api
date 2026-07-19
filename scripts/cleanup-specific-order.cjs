const fs = require('fs');
const path = require('path');
const admin = require('firebase-admin');

const ORDER_ID = process.env.ORDER_ID || process.argv[2];
if (!ORDER_ID) {
  throw new Error('ORDER_ID es requerido');
}

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
  const repsSnap = await db.ref('repartidores').once('value');
  const reps = repsSnap.val() || {};

  const updates = {
    [`pedidos/${ORDER_ID}`]: null,
    [`pedidos_para_reparto/${ORDER_ID}`]: null,
    [`pedidos_en_camino/${ORDER_ID}`]: null,
    [`pedidos_activos/${ORDER_ID}`]: null
  };

  let clearedDrivers = 0;
  for (const [uid, value] of Object.entries(reps)) {
    if (String(value?.pedido_activo || '').trim() === ORDER_ID) {
      updates[`repartidores/${uid}/pedido_activo`] = null;
      clearedDrivers += 1;
    }
  }

  await db.ref().update(updates);

  const [pedidoSnap, repartoSnap, caminoSnap, activoSnap] = await Promise.all([
    db.ref(`pedidos/${ORDER_ID}`).once('value'),
    db.ref(`pedidos_para_reparto/${ORDER_ID}`).once('value'),
    db.ref(`pedidos_en_camino/${ORDER_ID}`).once('value'),
    db.ref(`pedidos_activos/${ORDER_ID}`).once('value')
  ]);

  console.log(JSON.stringify({
    ok: true,
    orderId: ORDER_ID,
    clearedDrivers,
    remaining: {
      pedido: pedidoSnap.exists(),
      pedidos_para_reparto: repartoSnap.exists(),
      pedidos_en_camino: caminoSnap.exists(),
      pedidos_activos: activoSnap.exists()
    }
  }, null, 2));

  await admin.app().delete();
}

main().catch(async (error) => {
  console.error(JSON.stringify({ ok: false, orderId: ORDER_ID, error: error.message }, null, 2));
  if (admin.apps.length) await admin.app().delete();
  process.exit(1);
});
