/**
 * Limpiar pedidos residuales del teléfono
 * 
 * Mover pedidos EN_CAMINO "huérfanos" a pedidos_completados
 * para que el teléfono muestre estado limpio
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

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

  throw new Error('No se encontró credencial Firebase Admin');
}

async function initFirebase() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 
    'https://nelly-delivery-default-rtdb.firebaseio.com';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  return admin;
}

async function cleanupResidualOrders(admin, driverUid) {
  log(colors.blue, `\n🧹 Limpiando pedidos residuales para: ${driverUid}`);

  try {
    const db = admin.database();

    // Buscar en pedidos_en_camino
    const snapshot = await db.ref('pedidos_en_camino').once('value');
    const residual = [];

    if (snapshot.exists()) {
      snapshot.forEach(child => {
        const data = child.val();
        if (data.repartidor_id === driverUid) {
          residual.push({
            id: child.key,
            ...data,
          });
        }
      });
    }

    if (residual.length === 0) {
      log(colors.green, `✅ No hay pedidos residuales para ese UID`);
      return true;
    }

    log(colors.yellow, `⚠️  Encontrados ${residual.length} pedidos residuales:`);
    residual.forEach((order, i) => {
      log(colors.cyan, `  ${i + 1}. ${order.id} - $${order.monto} (${order.cliente_nombre})`);
    });

    // Mover a pedidos_completados
    log(colors.blue, `\n📦 Archivando a pedidos_completados...`);

    for (const order of residual) {
      const completed = {
        ...order,
        estado: 'COMPLETADO_CLEANUP',
        cleaned_at: new Date().toISOString(),
        cleaned_reason: 'residual_state_cleanup_pre_gate_ssot_001',
      };

      // Archivar en completados
      await db.ref(`pedidos_completados/${order.id}`).set(completed);

      // Eliminar de en_camino
      await db.ref(`pedidos_en_camino/${order.id}`).remove();

      log(colors.green, `  ✅ Archivado: ${order.id}`);
    }

    log(colors.green, `\n✅ LIMPIEZA COMPLETADA`);
    log(colors.cyan, `   ${residual.length} pedido(s) archivado(s)`);
    log(colors.cyan, `   El teléfono debe estar limpio ahora`);

    return true;

  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return false;
  }
}

async function main() {
  log(colors.cyan, `
╔═══════════════════════════════════════════════════════╗
║  Limpiar Pedidos Residuales del Teléfono             ║
║  Mover EN_CAMINO → pedidos_completados               ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    await initFirebase();

    // UID encontrado del teléfono
    const phoneUid = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';

    log(colors.yellow, `\n📱 Limpiando para UID: ${phoneUid}`);
    log(colors.yellow, `   Este es el UID del teléfono con "Operación Activa"`);

    const success = await cleanupResidualOrders(admin, phoneUid);

    if (success) {
      log(colors.green, `\n${'═'.repeat(50)}`);
      log(colors.green, `\n✅ PRÓXIMOS PASOS:`);
      log(colors.cyan, `   1. Cierra completamente la app Repartidor`);
      log(colors.cyan, `   2. Cierra sesión (si es necesario)`);
      log(colors.cyan, `   3. Abre la app de nuevo`);
      log(colors.cyan, `   4. Inicia sesión`);
      log(colors.cyan, `   5. Debe mostrar: "Pedidos Disponibles" (sin "Operación Activa")`);
      log(colors.cyan, `\n   Después: GATE_SSOT_001 Gate 2 está LISTO`);
    }

  } catch (error) {
    log(colors.red, `\n❌ Error crítico: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(colors.red, `Fatal error: ${error.message}`);
  process.exit(1);
});
