import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

function loadServiceAccount() {
  const secretPath = '/etc/secrets/nelly-admin.json';
  const localPath = path.join(process.cwd(), 'nelly-admin.json');

  if (fs.existsSync(secretPath)) {
    return JSON.parse(fs.readFileSync(secretPath, 'utf-8'));
  }

  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }

  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf-8'));
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

  const db = admin.database();
  const pedidoId = 'OPERATIVO_LISTO_1782059652633';

  console.log(`\n=== AUDITAR PEDIDO: ${pedidoId} ===\n`);

  // Buscar en todos los nodos
  const nodos = [
    'pedidos',
    'pedidos_para_reparto',
    'pedidos_en_camino',
    'pedidos_activos'
  ];

  for (const nodo of nodos) {
    const snap = await db.ref(`${nodo}/${pedidoId}`).once('value');
    const pedido = snap.val();
    if (pedido) {
      console.log(`✅ ENCONTRADO EN: ${nodo}`);
      console.log(`   Estado: ${pedido.estado || pedido.estado_pedido || 'N/A'}`);
      console.log(`   Repartidor: ${pedido.repartidor_id || 'N/A'}`);
      console.log(`   Monto: $${pedido.monto}`);
    }
  }

  console.log(`\n=== LIMPIAR Y RECREAR ===\n`);

  // Limpiar de todos lados
  await Promise.all([
    db.ref(`pedidos/${pedidoId}`).remove(),
    db.ref(`pedidos_para_reparto/${pedidoId}`).remove(),
    db.ref(`pedidos_en_camino/${pedidoId}`).remove(),
    db.ref(`pedidos_activos/${pedidoId}`).remove()
  ]);

  console.log(`Pedido limpiado de todos los nodos.\n`);

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
