import app from './app.js';
import { iniciarAgenteDespacho, limpiarAgenteDespacho } from './src/agentes/agenteDespacho.js';
import { iniciarAgenteFinanciero } from './src/agentes/agenteTarifaDinamica.js';
import { iniciarAgenteAntifraude } from './src/agentes/agenteAntifraude.js';
import { iniciarAgenteSoporte, limpiarAgenteSoporte } from './src/agentes/agenteSoporte.js';
import { getAdmin } from './config/firebase-admin-esm.js';
import { startC5ShadowObserver } from './src/services/c5ShadowObserver.js';

let c5ShadowObserver = null;

function isEnabled(value) {
  return String(value || '').trim().toLowerCase() === 'true';
}

async function iniciarC5ShadowValidator() {
  if (!isEnabled(process.env.ENABLE_C5_SHADOW_VALIDATOR)) return;

  try {
    const admin = await getAdmin();
    c5ShadowObserver = await startC5ShadowObserver({
      db: admin.database(),
      enabled: true,
      logger: console
    });
    console.log('[C5_SHADOW] Observador de solo lectura habilitado');
  } catch (error) {
    console.error('[C5_SHADOW] No se pudo iniciar; el flujo operativo continúa sin sombra:', error.message);
    c5ShadowObserver = null;
  }
}

function limpiarC5ShadowValidator() {
  c5ShadowObserver?.stop();
  c5ShadowObserver = null;
}

async function iniciarAgentes() {
  try {
    await iniciarAgenteDespacho();
    await iniciarAgenteFinanciero();
    await iniciarAgenteAntifraude();
    await iniciarAgenteSoporte();
    console.log('✅ Runtime principal operando sin Firestore bridge');
  } catch (error) {
    console.error('❌ Error inicializando agentes:', error.message);
    throw error;
  }
}

// Limpieza de listeners al cerrar el proceso
process.on('SIGINT', () => {
  limpiarC5ShadowValidator();
  limpiarAgenteDespacho();
  limpiarAgenteSoporte();
  process.exit(0);
});
process.on('SIGTERM', () => {
  limpiarC5ShadowValidator();
  limpiarAgenteDespacho();
  limpiarAgenteSoporte();
  process.exit(0);
});

const PORT = process.env.PORT || 3001;

if (process.env.NODE_ENV !== 'test') {
  await iniciarAgentes();
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Servidor de Nelly corriendo en el puerto ${PORT}`);
  });
  void iniciarC5ShadowValidator();
}
