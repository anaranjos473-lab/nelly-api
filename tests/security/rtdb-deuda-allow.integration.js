const fs = require('fs');
const path = require('path');
const { initializeTestEnvironment } = require('@firebase/rules-unit-testing');

function nowIsoSafe() {
  return new Date().toISOString().replace(/:/g, '-');
}

function ensureLogsDir() {
  const logsDir = path.resolve(__dirname, '..', '..', 'logs_pruebas');
  if (!fs.existsSync(logsDir)) {
    fs.mkdirSync(logsDir, { recursive: true });
  }
  return logsDir;
}

function writeValidationLog(payload) {
  const logsDir = ensureLogsDir();
  const fileName = `security_validation_allow_${nowIsoSafe()}.json`;
  const filePath = path.join(logsDir, fileName);
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2), 'utf8');
  return filePath;
}

function getDbHostConfig() {
  const hostRaw = String(process.env.FIREBASE_DATABASE_EMULATOR_HOST || '').trim();
  if (!hostRaw) {
    return { host: '127.0.0.1', port: 9000 };
  }
  const parts = hostRaw.split(':');
  const host = parts[0] || '127.0.0.1';
  const port = Number(parts[1] || 9000);
  if (!Number.isFinite(port) || port <= 0) {
    throw new Error(`Puerto de emulador invalido: ${hostRaw}`);
  }
  return { host, port };
}

async function run() {
  const projectId = 'demo-nelly-security';
  const driverUid = 'driver_bronce_allow';
  const pedidoId = 'pedido_allow_001';
  const deudaActual = 100;
  const limiteDeuda = 300;
  const { host, port } = getDbHostConfig();

  let testEnv;
  const result = {
    fecha_iso: new Date().toISOString(),
    prueba: 'integracion_seguridad_deuda_allow_bronce',
    escenario: {
      uid: driverUid,
      nivel: 'BRONCE',
      deuda_actual: deudaActual,
      limite_deuda: limiteDeuda,
      bloqueado_por_deuda: false,
      operacion: `write pedidos_activos/${pedidoId}`
    },
    esperado: 'ALLOW (escritura permitida)',
    exitoso: false,
    error: null
  };

  try {
    const rulesPath = path.resolve(__dirname, '..', '..', 'security_rules.json');
    const rules = fs.readFileSync(rulesPath, 'utf8');

    testEnv = await initializeTestEnvironment({
      projectId,
      database: { host, port, rules }
    });

    await testEnv.withSecurityRulesDisabled(async (context) => {
      const adminDb = context.database();
      await adminDb.ref(`repartidores/${driverUid}/estatus/nivel`).set('BRONCE');
      await adminDb.ref(`repartidores/${driverUid}/estatus/bloqueado_por_deuda`).set(false);
      await adminDb.ref(`repartidores/${driverUid}/perfil/bloqueado_por_deuda`).set(false);
      await adminDb.ref(`repartidores/${driverUid}/finanzas/deuda_actual`).set(deudaActual);
      await adminDb.ref(`repartidores/${driverUid}/finanzas/limite_deuda`).set(limiteDeuda);
    });

    const driverDb = testEnv.authenticatedContext(driverUid).database();

    try {
      await driverDb.ref(`pedidos_activos/${pedidoId}`).set({
        repartidor_id: driverUid,
        estado: 'pendiente'
      });

      result.exitoso = true;
      result.error = null;
      const logPath = writeValidationLog(result);
      console.log(`[SECURITY_TEST_ALLOW] OK: escritura permitida como se esperaba. Log: ${logPath}`);
      process.exit(0);
    } catch (error) {
      result.exitoso = false;
      result.error = {
        code: error.code || null,
        message: error.message || String(error)
      };
      const logPath = writeValidationLog(result);
      console.error(`[SECURITY_TEST_ALLOW] FALLO: escritura bloqueada cuando debia permitirse. Log: ${logPath}`);
      process.exit(1);
    }
  } catch (error) {
    result.error = {
      code: error.code || null,
      message: error.message || String(error)
    };
    const logPath = writeValidationLog(result);
    console.error(`[SECURITY_TEST_ALLOW] ERROR DE EJECUCION. Log: ${logPath}`);
    console.error(error);
    process.exit(1);
  } finally {
    if (testEnv) {
      await testEnv.cleanup();
    }
  }
}

run();
