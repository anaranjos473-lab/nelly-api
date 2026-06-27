/**
 * Investigar estado residual del teléfono
 * 
 * Buscar:
 * 1. UID del usuario logueado
 * 2. Pedido de $129 en pedidos_en_camino
 * 3. Por qué la app muestra "Operación Activa"
 */

import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Color output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m',
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

/**
 * Buscar pedidos en pedidos_en_camino con monto $129
 */
async function findOrderByAmount(admin, amount = 129) {
  log(colors.blue, `\n🔍 Buscando pedidos en pedidos_en_camino con monto $${amount}`);

  try {
    const db = admin.database();
    const snapshot = await db.ref('pedidos_en_camino').once('value');

    if (!snapshot.exists()) {
      log(colors.yellow, '⚠️  No hay pedidos en pedidos_en_camino');
      return [];
    }

    const found = [];
    snapshot.forEach(child => {
      const data = child.val();
      if (Math.abs(data.monto - amount) < 0.01) {
        found.push({
          id: child.key,
          ...data,
        });
      }
    });

    if (found.length === 0) {
      log(colors.yellow, `⚠️  No hay pedidos con monto $${amount}`);
      return [];
    }

    log(colors.green, `✅ Encontrados ${found.length} pedido(s) con monto $${amount}`);
    found.forEach((order, i) => {
      log(colors.cyan, `\n  Pedido ${i + 1}:`);
      log(colors.cyan, `    ID: ${order.id}`);
      log(colors.cyan, `    Monto: $${order.monto}`);
      log(colors.cyan, `    Repartidor UID: ${order.repartidor_id || 'NO ASIGNADO'}`);
      log(colors.cyan, `    Cliente: ${order.cliente_nombre}`);
      log(colors.cyan, `    Estado: ${order.estado}`);
      log(colors.cyan, `    Timestamp: ${new Date(order.timestamp).toISOString()}`);
    });

    return found;

  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return [];
  }
}

/**
 * Buscar todos los pedidos para un repartidor específico
 */
async function findOrdersByDriver(admin, driverUid) {
  log(colors.blue, `\n🔍 Buscando todos los pedidos para repartidor: ${driverUid}`);

  try {
    const db = admin.database();

    // Buscar en pedidos_en_camino
    const enCaminoSnapshot = await db.ref('pedidos_en_camino')
      .orderByChild('repartidor_id')
      .equalTo(driverUid)
      .once('value');

    // Buscar en pedidos_para_reparto
    const paraRepartoSnapshot = await db.ref('pedidos_para_reparto')
      .once('value');

    const results = {
      en_camino: [],
      para_reparto: [],
    };

    if (enCaminoSnapshot.exists()) {
      enCaminoSnapshot.forEach(child => {
        results.en_camino.push({
          id: child.key,
          ...child.val(),
        });
      });
    }

    // Buscar manualmente en para_reparto (no tiene índice por repartidor_id típicamente)
    if (paraRepartoSnapshot.exists()) {
      paraRepartoSnapshot.forEach(child => {
        const data = child.val();
        if (data.repartidor_id === driverUid) {
          results.para_reparto.push({
            id: child.key,
            ...data,
          });
        }
      });
    }

    log(colors.green, `✅ Encontrados ${results.en_camino.length} en EN_CAMINO`);
    if (results.en_camino.length > 0) {
      results.en_camino.forEach((order, i) => {
        log(colors.cyan, `\n  EN_CAMINO ${i + 1}:`);
        log(colors.cyan, `    ID: ${order.id}`);
        log(colors.cyan, `    Monto: $${order.monto}`);
        log(colors.cyan, `    Cliente: ${order.cliente_nombre}`);
        log(colors.cyan, `    Estado: ${order.estado}`);
      });
    }

    log(colors.green, `✅ Encontrados ${results.para_reparto.length} en PARA_REPARTO`);
    if (results.para_reparto.length > 0) {
      results.para_reparto.forEach((order, i) => {
        log(colors.cyan, `\n  PARA_REPARTO ${i + 1}:`);
        log(colors.cyan, `    ID: ${order.id}`);
        log(colors.cyan, `    Monto: $${order.monto}`);
      });
    }

    return results;

  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return { en_camino: [], para_reparto: [] };
  }
}

/**
 * Buscar todos los pedidos EN_CAMINO
 */
async function findAllActiveOrders(admin) {
  log(colors.blue, `\n🔍 Buscando TODOS los pedidos EN_CAMINO (activos)`);

  try {
    const db = admin.database();
    const snapshot = await db.ref('pedidos_en_camino').once('value');

    if (!snapshot.exists()) {
      log(colors.yellow, '⚠️  No hay pedidos en pedidos_en_camino');
      return [];
    }

    const orders = [];
    snapshot.forEach(child => {
      orders.push({
        id: child.key,
        ...child.val(),
      });
    });

    log(colors.green, `✅ Total pedidos EN_CAMINO: ${orders.length}`);
    orders.forEach((order, i) => {
      log(colors.magenta, `\n  Pedido ${i + 1}:`);
      log(colors.cyan, `    ID: ${order.id}`);
      log(colors.cyan, `    Monto: $${order.monto}`);
      log(colors.cyan, `    Repartidor UID: ${order.repartidor_id || 'NO ASIGNADO'}`);
      log(colors.cyan, `    Cliente: ${order.cliente_nombre}`);
      log(colors.cyan, `    Estado: ${order.estado}`);
      log(colors.cyan, `    Creado: ${new Date(order.timestamp || order.hora_cocina).toISOString()}`);
    });

    return orders;

  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return [];
  }
}

/**
 * Limpiar un pedido de pedidos_en_camino
 */
async function cleanupOrder(admin, orderId) {
  log(colors.blue, `\n🧹 Limpiando pedido: ${orderId}`);

  try {
    const db = admin.database();
    
    // Verificar que existe
    const snapshot = await db.ref(`pedidos_en_camino/${orderId}`).once('value');
    
    if (!snapshot.exists()) {
      log(colors.yellow, `⚠️  Pedido no existe en pedidos_en_camino`);
      return false;
    }

    const orderData = snapshot.val();
    log(colors.cyan, `  Datos actuales:`);
    log(colors.cyan, `    Monto: $${orderData.monto}`);
    log(colors.cyan, `    Cliente: ${orderData.cliente_nombre}`);
    log(colors.cyan, `    Repartidor: ${orderData.repartidor_id}`);

    // Opciones de limpieza
    log(colors.yellow, `\n  Opciones:`);
    log(colors.yellow, `    1. Marcar como COMPLETADO`);
    log(colors.yellow, `    2. Mover a pedidos_completados`);
    log(colors.yellow, `    3. Eliminar (peligroso)`);
    log(colors.yellow, `\n  Para ejecutar limpieza, usa script interactivo.`);

    return true;

  } catch (error) {
    log(colors.red, `❌ Error: ${error.message}`);
    return false;
  }
}

/**
 * Main
 */
async function main() {
  log(colors.cyan, `
╔═══════════════════════════════════════════════════════╗
║  Investigar Estado Residual del Teléfono             ║
║  Buscar: Pedido $129, UID activo, por qué            ║
║  "Operación Activa"                                  ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    await initFirebase();

    // Paso 1: Buscar todos los pedidos en camino
    const allActive = await findAllActiveOrders(admin);

    if (allActive.length === 0) {
      log(colors.green, `\n✅ No hay pedidos EN_CAMINO residuales`);
      log(colors.green, `   El teléfono debería mostrar "Pedidos Disponibles"`);
      process.exit(0);
    }

    // Paso 2: Buscar específicamente el de $129
    log(colors.blue, `\n${'═'.repeat(50)}`);
    const foundByAmount = await findOrderByAmount(admin, 129);

    if (foundByAmount.length > 0) {
      log(colors.magenta, `\n⚠️  ENCONTRADO: Pedido de $129 residual`);
      log(colors.magenta, `   Esto explica por qué el teléfono muestra "Operación Activa"`);
      
      const order = foundByAmount[0];
      log(colors.yellow, `\n📋 INFORMACIÓN DEL PEDIDO:`);
      log(colors.cyan, `   ID: ${order.id}`);
      log(colors.cyan, `   Repartidor UID: ${order.repartidor_id}`);
      log(colors.cyan, `   Estado: ${order.estado}`);
      log(colors.cyan, `   Timestamp: ${new Date(order.timestamp).toISOString()}`);
      
      if (order.repartidor_id) {
        log(colors.yellow, `\n🔍 Buscando otros pedidos del mismo repartidor...`);
        await findOrdersByDriver(admin, order.repartidor_id);
      }

      log(colors.yellow, `\n💡 RECOMENDACIÓN:`);
      log(colors.yellow, `   Este pedido debe ser:`);
      log(colors.yellow, `   1. Completado (marcar ENTREGADO)`);
      log(colors.yellow, `   2. O movido a pedidos_completados`);
      log(colors.yellow, `   3. O eliminado (después de confirmar)`);
      log(colors.yellow, `\n   Después: Cierra sesión/app → Abre de nuevo → Gate 2`);
    }

    // Resumen
    log(colors.blue, `\n${'═'.repeat(50)}`);
    log(colors.magenta, `\n📊 RESUMEN:`);
    log(colors.cyan, `   Total EN_CAMINO: ${allActive.length}`);
    if (foundByAmount.length > 0) {
      log(colors.red, `   ⚠️  Pedido $129 residual: SÍ`);
      log(colors.yellow, `   ACCIÓN: Limpiar antes de Gate 2`);
    } else {
      log(colors.green, `   ✅ Sin pedidos $129 residuales`);
      log(colors.green, `   ✅ LISTO para Gate 2`);
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
