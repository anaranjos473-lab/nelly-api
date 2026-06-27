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

  // UID del driver
  const driverUid = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';
  const pedidoId = `OPERATIVO_LISTO_${Date.now()}`;
  const ahora = Date.now();

  // Crear pedido YA ACEPTADO en pedidos_en_camino (bypasear accept-order)
  const payload = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'DJ Sinchoque - Operativo',
    descripcion: 'Ciclo completo: Accept→GPS→Complete',
    monto: 200.0,
    estado: 'EN_CAMINO',
    estado_pedido: 'EN_CAMINO',
    repartidor_id: driverUid,
    conductorId: driverUid,
    aceptado_en: ahora,
    timestamp: ahora,
    fuente_origen: 'script_operativo_listo'
  };

  try {
    // Escribir en pedidos_en_camino (YA ACEPTADO)
    await db.ref(`pedidos_en_camino/${pedidoId}`).set(payload);
    
    // Registrar en pedido_activo del driver
    await db.ref(`repartidores/${driverUid}/pedido_activo`).set(pedidoId);
    
    // También en /pedidos para compatibilidad
    await db.ref(`pedidos/${pedidoId}`).set({
      ...payload,
      origen: 'script_operativo'
    });

    console.log('\n✅ PEDIDO LISTO PARA ENTREGA CREADO:\n');
    console.log(`   ID: ${pedidoId}`);
    console.log(`   Cliente: ${payload.cliente_nombre}`);
    console.log(`   Monto: $${payload.monto}`);
    console.log(`   Estado: EN_CAMINO (YA ACEPTADO)`);
    console.log(`   Driver UID: ${driverUid}`);
    console.log(`\n📱 En la app del driver:\n   - No necesita ver el pedido\n   - Solo pulsa ENTREGA COMPLETADA cuando esté listo\n`);
    console.log(`🎯 Luego ve al panel y marca ENTREGA COMPLETADA\n`);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }

  process.exit(0);
}

main().catch(err => {
  console.error('Error:', err.message);
  process.exit(1);
});
