// Verificar estado actual del pedido
import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

const firebaseAdminPath = process.env.FIREBASE_ADMIN_JSON || './nelly-admin.json';
const serviceAccount = JSON.parse(fs.readFileSync(firebaseAdminPath, 'utf-8'));

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
});

const db = app.database();

async function verificarPedido() {
  const PEDIDO_ID = 'FINAL_CICLO_1782060235668';

  console.log(`\n🔍 Verificando pedido: ${PEDIDO_ID}\n`);

  try {
    // Buscar en pedidos_en_camino
    let snap = await db.ref(`pedidos_en_camino/${PEDIDO_ID}`).once('value');
    console.log(`📍 pedidos_en_camino/${PEDIDO_ID}:`);
    console.log(snap.val() ? JSON.stringify(snap.val(), null, 2) : '❌ No encontrado');

    // Buscar en pedidos
    snap = await db.ref(`pedidos/${PEDIDO_ID}`).once('value');
    console.log(`\n📍 pedidos/${PEDIDO_ID}:`);
    console.log(snap.val() ? JSON.stringify(snap.val(), null, 2) : '❌ No encontrado');

    // Buscar en pedidos_para_reparto
    snap = await db.ref(`pedidos_para_reparto/${PEDIDO_ID}`).once('value');
    console.log(`\n📍 pedidos_para_reparto/${PEDIDO_ID}:`);
    console.log(snap.val() ? JSON.stringify(snap.val(), null, 2) : '❌ No encontrado');

    // Verificar finanzas
    snap = await db.ref(`finanzas/cobros_efectivos`).orderByChild('pedido_id').equalTo(PEDIDO_ID).once('value');
    console.log(`\n💰 Finanzas para ${PEDIDO_ID}:`);
    const finanzas = snap.val();
    if (finanzas) {
      Object.entries(finanzas).forEach(([k, v]) => {
        console.log(`  ✅ ${JSON.stringify(v)}`);
      });
    } else {
      console.log('  ❌ No encontrado');
    }

    // Ver saldo del driver
    const DRIVER_UID = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';
    snap = await db.ref(`repartidores/${DRIVER_UID}/saldo_efectivo`).once('value');
    console.log(`\n💵 Saldo del driver ${DRIVER_UID}: $${snap.val() || 0}`);

  } catch (error) {
    console.error('❌ Error:', error.message);
  }

  process.exit(0);
}

verificarPedido();
