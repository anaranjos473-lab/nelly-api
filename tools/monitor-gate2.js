/**
 * Monitor para Gate 2
 * - Escucha child_added en RTDB: pedidos_para_reparto
 * - Escucha child_removed en RTDB: pedidos_para_reparto
 * - Escucha child_added en RTDB: pedidos_en_camino
 * - Cuando detecta un pedido, consulta Firestore financiero cada 3s
 * - NO modifica Firebase
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

function loadServiceAccount() {
  const secretPath = '/etc/secrets/nelly-admin.json';
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(secretPath)) return JSON.parse(fs.readFileSync(secretPath,'utf8'));
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{') ? JSON.parse(raw) : JSON.parse(Buffer.from(raw,'base64').toString('utf8'));
  }
  if (fs.existsSync(localPath)) return JSON.parse(fs.readFileSync(localPath,'utf8'));
  throw new Error('No se encontró credencial Firebase Admin');
}

async function init() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
  if (!admin.apps.length) {
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount), databaseURL });
  }
  return admin;
}

function now() { return new Date().toISOString(); }

async function monitor() {
  const admin = await init();
  const db = admin.database();
  const firestore = admin.firestore();

  console.log('\n[monitor-gate2] Iniciado - escuchando RTDB y Firestore');
  console.log(`[monitor-gate2] ${now()}`);

  const seenPedidos = new Set();

  db.ref('pedidos_para_reparto').on('child_added', (snap) => {
    const id = snap.key;
    const data = snap.val();
    console.log(`\n[RTDB] pedidos_para_reparto child_added => id=${id} time=${now()}`);
    console.log(data);
    seenPedidos.add(id);

    // start polling Firestore for financial movements for this pedido
    pollFinanzasForPedido(firestore, id).catch(err => console.error('[monitor] poll error', err));
  });

  db.ref('pedidos_para_reparto').on('child_removed', (snap) => {
    const id = snap.key;
    console.log(`\n[RTDB] pedidos_para_reparto child_removed => id=${id} time=${now()}`);
  });

  db.ref('pedidos_en_camino').on('child_added', (snap) => {
    const id = snap.key;
    const data = snap.val();
    console.log(`\n[RTDB] pedidos_en_camino child_added => id=${id} time=${now()}`);
    console.log(data);
  });

  db.ref('pedidos_en_camino').on('child_removed', (snap) => {
    const id = snap.key;
    console.log(`\n[RTDB] pedidos_en_camino child_removed => id=${id} time=${now()}`);
  });

  // also print current snapshot counts periodically
  setInterval(async () => {
    try {
      const pr = await db.ref('pedidos_para_reparto').once('value');
      const ec = await db.ref('pedidos_en_camino').once('value');
      console.log(`[monitor] snapshot ${now()} pedidos_para_reparto=${pr.numChildren()} pedidos_en_camino=${ec.numChildren()}`);
    } catch (e) {
      console.error('[monitor] snapshot error', e.message);
    }
  }, 15000);
}

async function pollFinanzasForPedido(firestore, pedidoId) {
  console.log(`[monitor] Iniciando poll financiero para pedido=${pedidoId}`);
  const col = firestore.collection('financiero').doc('movimientos').collection('items');
  let found = false;
  while (!found) {
    try {
      const q = await col.where('id_pedido', '==', pedidoId).get();
      if (!q.empty) {
        q.forEach(doc => {
          console.log(`\n[Firestore] movimiento detectado para pedido=${pedidoId} idDoc=${doc.id} data=`);
          console.log(doc.data());
        });
        found = true;
        break;
      }
    } catch (e) {
      console.error('[monitor] error consultando finanzas', e.message);
    }
    await new Promise(r => setTimeout(r, 3000));
  }
}

monitor().catch(err => { console.error('monitor error', err); process.exit(1); });
