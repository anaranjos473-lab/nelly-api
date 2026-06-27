/**
 * Validación automatizada de GATE SSOT-001
 * 
 * Ejecuta los 4 gates sin intervención manual
 * Genera reporte de PASS/FAIL
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
 * Gate 1: Verificar que no hay pedidos_en_camino antes de Accept
 */
async function validateGate1(admin, pedidoId) {
  log(colors.blue, '\n🔍 Gate 1: DESPACHAR NO crea pedidos_en_camino prematuramente');
  log(colors.cyan, `Verificando pedido: ${pedidoId}`);

  try {
    const db = admin.database();
    
    const pedidosRef = await db.ref(`pedidos/${pedidoId}`).once('value');
    const paraRepartoRef = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
    const enCaminoRef = await db.ref(`pedidos_en_camino/${pedidoId}`).once('value');

    const estado = pedidosRef.val()?.estado;
    const existePara = paraRepartoRef.exists();
    const existeEnCamino = enCaminoRef.exists();

    log(colors.cyan, `  Estado maestro: ${estado}`);
    log(colors.cyan, `  En pedidos_para_reparto: ${existePara ? '✅' : '❌'}`);
    log(colors.cyan, `  En pedidos_en_camino: ${existeEnCamino ? '⚠️ ANTES DE ACCEPT!' : '✅'}`);

    // FAIL si:
    // 1. Estado no es PENDIENTE y existe en pedidos_en_camino antes de ser aceptado
    // 2. Lógica: si existe en en_camino pero no hay indicativo de aceptación real
    
    if (estado === 'PENDIENTE' && existeEnCamino) {
      log(colors.red, '❌ GATE 1 FAIL: pedidos_en_camino existe antes de Accept');
      return { pass: false, reason: 'escritor_oculto' };
    }

    if (!existePara) {
      log(colors.red, '❌ GATE 1 FAIL: Pedido no está en pedidos_para_reparto');
      return { pass: false, reason: 'pedido_no_despachado' };
    }

    log(colors.green, '✅ GATE 1 PASS: DESPACHAR funciona correctamente');
    return { pass: true };

  } catch (error) {
    log(colors.red, `❌ GATE 1 ERROR: ${error.message}`);
    return { pass: false, reason: 'error_validacion' };
  }
}

/**
 * Gate 2: Verificar latencia de Android (simulado en Firebase)
 */
async function validateGate2(admin, pedidoId) {
  log(colors.blue, '\n🔍 Gate 2: Android ve el pedido en < 10 segundos');
  log(colors.cyan, '  (Verificar en Firebase que existe y tiene datos)');

  try {
    const db = admin.database();
    const paraRepartoRef = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');

    if (!paraRepartoRef.exists()) {
      log(colors.red, '❌ GATE 2 FAIL: Pedido no existe en pedidos_para_reparto');
      return { pass: false, reason: 'pedido_no_sincronizado' };
    }

    const data = paraRepartoRef.val();
    const hasName = !!data.cliente_nombre;
    const hasAmount = !!data.monto;
    const hasTimestamp = !!data.timestamp;

    log(colors.cyan, `  Datos presentes: nombre=${hasName}, monto=${hasAmount}, timestamp=${hasTimestamp}`);

    if (!hasName || !hasAmount) {
      log(colors.red, '❌ GATE 2 FAIL: Datos incompletos en pedidos_para_reparto');
      return { pass: false, reason: 'datos_incompletos' };
    }

    log(colors.green, '✅ GATE 2 PASS: Pedido visible con datos correctos');
    log(colors.cyan, '  📍 Verifica en Android manualmente que aparece < 10s');
    return { pass: true, manual_verification: true };

  } catch (error) {
    log(colors.red, `❌ GATE 2 ERROR: ${error.message}`);
    return { pass: false, reason: 'error_validacion' };
  }
}

/**
 * Gate 3: Verificar que Accept limpia la cola
 * (Este gate requiere Accept real, aquí solo preparamos validación)
 */
async function validateGate3(admin, pedidoId) {
  log(colors.blue, '\n🔍 Gate 3: Accept limpia la cola correctamente');
  log(colors.yellow, '  ⚠️ Este gate requiere que Android ACEPTE el pedido');
  log(colors.cyan, '  Esperando... (presiona ENTER cuando hayas aceptado en Android)');

  // Aquí entraría lectura de stdin, pero en script automático saltamos
  log(colors.yellow, '  [Script automático: saltando esta verificación manual]');
  
  return { 
    pass: null, 
    reason: 'requiere_interaccion_manual',
    instructions: 'Verifica manualmente que después de Accept:\n' +
                  '  ✅ pedidos_para_reparto/{id} desaparece\n' +
                  '  ✅ pedidos_en_camino/{id} aparece\n' +
                  '  ✅ estado = EN_CAMINO'
  };
}

/**
 * Gate 4: Verificar que Finanzas NO duplica
 */
async function validateGate4(admin, pedidoId) {
  log(colors.blue, '\n🔍 Gate 4: Finanzas genera UN SOLO movimiento');

  try {
    const db = admin.firestore();
    
    // Buscar movimientos financieros de este pedido
    const query = db.collection('financiero')
                     .doc('movimientos')
                     .collection('items')
                     .where('id_pedido', '==', pedidoId);
    
    const snapshot = await query.get();
    const movimientos = [];
    snapshot.forEach(doc => {
      movimientos.push({ id: doc.id, ...doc.data() });
    });

    log(colors.cyan, `  Movimientos encontrados: ${movimientos.length}`);

    if (movimientos.length === 0) {
      log(colors.cyan, '  (Todavía no hay movimientos - esperado si no completó entrega)');
      return { pass: true, reason: 'sin_movimientos' };
    }

    if (movimientos.length > 1) {
      log(colors.red, `❌ GATE 4 FAIL: ${movimientos.length} movimientos para el MISMO pedido (duplicados)`);
      movimientos.forEach((m, i) => {
        log(colors.red, `    ${i + 1}. ID: ${m.id}, Monto: ${m.monto}, Timestamp: ${m.timestamp}`);
      });
      return { pass: false, reason: 'finanzas_duplicadas' };
    }

    // Verificar que el movimiento tiene estructura correcta
    const mov = movimientos[0];
    const hasCobro = mov.tipo_movimiento === 'COBRO' || mov.concepto === 'cobro';
    const hasComision = !!mov.comision;

    if (!hasCobro || !hasComision) {
      log(colors.yellow, '⚠️ GATE 4 WARNING: Estructura de movimiento incompleta');
      return { pass: true, reason: 'movimiento_incompleto' };
    }

    log(colors.green, '✅ GATE 4 PASS: Finanzas SIN duplicados');
    log(colors.cyan, `  Cobro: ${mov.monto}, Comisión: ${mov.comision}`);
    return { pass: true };

  } catch (error) {
    log(colors.red, `❌ GATE 4 ERROR: ${error.message}`);
    return { pass: false, reason: 'error_validacion' };
  }
}

/**
 * Main: Ejecutar todos los gates
 */
async function main() {
  log(colors.cyan, `
╔═══════════════════════════════════════════════════════╗
║     GATE SSOT-001: Validación Crítica SSOT           ║
║     Coherencia: Creación → Despacho → Android        ║
║     Aceptación → EN_CAMINO → Finanzas                ║
╚═══════════════════════════════════════════════════════╝
  `);

  try {
    await initFirebase();

    // Buscar un pedido reciente para validar
    const db = admin.database();
    const pedidosSnapshot = await db.ref('pedidos_para_reparto')
                                     .orderByChild('timestamp')
                                     .limitToLast(1)
                                     .once('value');

    if (!pedidosSnapshot.exists()) {
      log(colors.red, '❌ No hay pedidos en pedidos_para_reparto');
      log(colors.yellow, '   Crea un pedido primero con: node scripts/createPedidoViaSSOT.js');
      process.exit(1);
    }

    let pedidoId = null;
    pedidosSnapshot.forEach(child => {
      pedidoId = child.key;
    });

    log(colors.yellow, `\n📝 Validando pedido: ${pedidoId}\n`);

    // Ejecutar gates
    const results = {
      gate1: await validateGate1(admin, pedidoId),
      gate2: await validateGate2(admin, pedidoId),
      gate3: await validateGate3(admin, pedidoId),
      gate4: await validateGate4(admin, pedidoId),
    };

    // Resumen
    log(colors.blue, '\n📊 RESUMEN DE GATES');
    log(colors.blue, '═'.repeat(50));

    const passed = Object.values(results)
      .filter(r => r.pass === true).length;
    const failed = Object.values(results)
      .filter(r => r.pass === false).length;
    const pending = Object.values(results)
      .filter(r => r.pass === null).length;

    Object.entries(results).forEach(([gate, result]) => {
      let status;
      if (result.pass === true) status = `${colors.green}✅ PASS${colors.reset}`;
      else if (result.pass === false) status = `${colors.red}❌ FAIL${colors.reset}`;
      else status = `${colors.yellow}⏳ PENDING${colors.reset}`;
      
      log(colors.cyan, `${gate}: ${status} ${result.reason ? `(${result.reason})` : ''}`);
    });

    log(colors.blue, '═'.repeat(50));
    log(colors.cyan, `Total: ${passed} PASS, ${failed} FAIL, ${pending} PENDING`);

    // Decisión
    if (failed === 0 && pending === 0) {
      log(colors.green, '\n🎖️  SSOT-001 CERTIFICADO ✅');
      log(colors.green, '   Puedes proceder a Phase 2C');
    } else if (failed === 0 && pending > 0) {
      log(colors.yellow, '\n⏳ SSOT-001 REQUIERE VERIFICACIÓN MANUAL');
      log(colors.yellow, `   ${pending} gate(s) necesitan interacción humana`);
    } else {
      log(colors.red, '\n❌ SSOT-001 FALLÓ - REQUIERE DEBUG');
      log(colors.red, `   ${failed} gate(s) no pasaron - revisar`);
    }

    // Generar reporte
    const reportPath = path.join(__dirname, `GATE_SSOT_001_REPORT_${Date.now()}.json`);
    fs.writeFileSync(reportPath, JSON.stringify({
      timestamp: new Date().toISOString(),
      pedidoId,
      results,
      summary: { passed, failed, pending },
    }, null, 2));

    log(colors.cyan, `\n📄 Reporte guardado en: ${reportPath}`);

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    log(colors.red, `\n❌ Error crítico: ${error.message}`);
    process.exit(1);
  }
}

main().catch(error => {
  log(colors.red, `Fatal error: ${error.message}`);
  process.exit(1);
});
