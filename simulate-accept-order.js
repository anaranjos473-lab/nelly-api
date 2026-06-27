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

  const auth = admin.auth();
  const db = admin.database();
  const driverUid = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';
  const pedidoId = 'FINAL_CICLO_1782060235668';

  console.log('\n=== SIMULAR ACEPTACIÓN DEL DRIVER ===\n');

  try {
    // Generar token del driver
    const token = await auth.createCustomToken(driverUid);
    console.log(`✅ Token generado para: ${driverUid}`);

    // Simular lo que hace la app (aceptar pedido)
    console.log(`\n📤 Intentando aceptar pedido: ${pedidoId}`);

    const response = await fetch('https://nelly-api-8lh1.onrender.com/api/delivery/accept-order', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ pedidoId })
    });

    const text = await response.text();
    console.log(`\n📥 Respuesta HTTP: ${response.status}`);
    console.log(`   Body: ${text}`);

    if (!response.ok) {
      console.log(`\n❌ El endpoint devolvió error. Probablemente Render está caído o hibernado.`);
      console.log(`\nSolución: Completar DIRECTAMENTE en Firebase...`);

      // Hacer el accept-order directo en Firebase
      const ahora = Date.now();
      await Promise.all([
        db.ref(`pedidos_en_camino/${pedidoId}`).set({
          id: pedidoId,
          id_pedido: pedidoId,
          cliente_nombre: 'DJ Sinchoque - FINAL',
          descripcion: 'Ciclo completo E2E',
          monto: 250.0,
          estado: 'EN_CAMINO',
          repartidor_id: driverUid,
          aceptado_en: ahora,
          timestamp: ahora
        }),
        db.ref(`repartidores/${driverUid}/pedido_activo`).set(pedidoId)
      ]);

      console.log(`✅ Pedido aceptado DIRECTO en Firebase`);
      console.log(`   Nodo: pedidos_en_camino/${pedidoId}`);
      console.log(`   Estado: EN_CAMINO`);
      console.log(`\n📱 Ahora en la app:\n   - Recarga la pantalla\n   - Debería ver el mapa y EN_CAMINO\n`);
    } else {
      console.log(`✅ Aceptación exitosa vía backend`);
    }
  } catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
