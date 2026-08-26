import fs from 'fs';
import path from 'path';
import { spawnSync } from 'child_process';

const ROOT = process.cwd();

const ENV_KEYS = [
  'FIREBASE_API_KEY',
  'FIREBASE_WEB_API_KEY',
  'FIREBASE_DATABASE_URL',
  'FIREBASE_ADMIN_JSON',
  'FIREBASE_SERVICE_ACCOUNT',
  'FIREBASE_ID_TOKEN',
  'AUTH_BOOTSTRAP_TOKEN',
  'DEV_AUTH_TOKEN',
  'DEV_AUTH_UID',
  'DRIVER_TEST_PASSWORD',
  'DRIVER_TEST_NAME',
  'P1_PANEL_EMAIL',
  'P1_PANEL_PASSWORD'
];

const GROUPS = {
  flow: {
    title: 'Flujo y gates',
    intro: 'Ruta rapida para crear, certificar y cerrar el flujo operativo.',
    items: [
      { path: 'docs/architecture/PILOTO_CONTROLADO/README.md', label: 'Indice maestro del piloto' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/GATE_E2E_001.md', label: 'Gate E2E-001' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/CHECKLIST_ULTRACORTA_GATE_E2E_001.md', label: 'Checklist ultracorta' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/FORMATO_CAPTURA_EVIDENCIA_GATE_E2E_001.md', label: 'Formato de evidencia' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/PLANTILLA_CIERRE_GATE_E2E_001.md', label: 'Plantilla de cierre' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/GO_LIVE_CERTIFICATION_001.md', label: 'Acta GO LIVE' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/ROADMAP_GATES_CERTIFICACION_PILOTO_V1.md', label: 'Roadmap de gates' },
      { path: 'scripts/validation/short-id-certification-001.mjs', label: 'Certificacion de folios' },
      { path: 'scripts/validation/contract-audit-001.mjs', label: 'Auditoria de contrato' },
      { path: 'scripts/validation/validate-panels-pre-pilot.mjs', label: 'Validacion visual de paneles' }
    ]
  },
  tokens: {
    title: 'Tokens y autenticacion',
    intro: 'Recursos para panel, driver, bootstrap y diagnostico de auth.',
    items: [
      { path: 'docs/contracts/DRIVER_TOKEN.md', label: 'Contrato del driver token' },
      { path: 'docs/contracts/COMPLETE_ORDER.md', label: 'Contrato complete-order' },
      { path: 'docs/contracts/ACCEPT_ORDER.md', label: 'Contrato accept-order' },
      { path: 'docs/contracts/UPDATE_LOCATION.md', label: 'Contrato update-location' },
      { path: 'docs/contracts/DATA_ACCESS_CONTRACT_v1.md', label: 'Contrato de acceso a datos' },
      { path: 'docs/adr/ADR-006-AUTHENTICATION.md', label: 'ADR autenticacion' },
      { path: 'scripts/create-driver-auth.cjs', label: 'Alta de auth para driver' },
      { path: 'scripts/create-driver-auth-simple.cjs', label: 'Alta de auth simple para driver' },
      { path: 'scripts/watch_token_change.js', label: 'Monitoreo de token FCM' },
      { path: 'scripts/resolve-test-config.js', label: 'Resolucion de configuracion local' },
      { path: 'scripts/verificar-firebase-admin.js', label: 'Verificacion de Firebase Admin' },
      { path: 'public/js/local-auth.js', label: 'Auth local de panel' },
      { path: 'public/js/premium-kitchen/firebase/index.js', label: 'Auth premium kitchen' },
      { path: 'app/src/main/java/com/nelly/driver/ui/pedidos/PedidosDisponiblesActivity.kt', label: 'Bootstrap auth Android driver' },
      { path: 'app/src/main/java/com/nelly/driver/data/remote/OrderAcceptClient.kt', label: 'Aceptacion con token' },
      { path: 'app/src/main/java/com/nelly/driver/data/remote/OrderCompleteClient.kt', label: 'Cierre con token' },
      { path: 'app/src/main/java/com/nelly/driver/data/remote/LocationUpdateClient.kt', label: 'GPS con token' }
    ]
  },
  errors: {
    title: 'Errores y RCA',
    intro: 'Puntos de entrada para investigar, acotar y cerrar incidencias.',
    items: [
      { path: 'prompts/nelly-rca.prompt.md', label: 'Prompt RCA maestro' },
      { path: 'docs/investigaciones/README.md', label: 'Indice de investigaciones' },
      { path: 'docs/investigaciones/INDEX.md', label: 'Tabla maestra de investigaciones' },
      { path: 'docs/investigaciones/ADR_LIGERO_RCA.md', label: 'ADR ligero RCA' },
      { path: 'docs/investigaciones/FRONT_TEMPLATE.md', label: 'Plantilla de frente RCA' },
      { path: 'docs/investigaciones/GO_LIVE_DRIVER_001.md', label: 'Frente GO_LIVE_DRIVER_001' },
      { path: 'docs/investigaciones/KITCHEN_SYNC_001.md', label: 'Frente KITCHEN_SYNC_001' },
      { path: 'docs/investigaciones/CONTRACT_AUDIT_001.md', label: 'Frente CONTRACT_AUDIT_001' },
      { path: 'docs/investigaciones/DATASET_FINALIZATION_001.md', label: 'Frente DATASET_FINALIZATION_001' },
      { path: 'docs/investigaciones/ACTIVE_ORDER_CLASSIFICATION_001.md', label: 'Frente ACTIVE_ORDER_CLASSIFICATION_001' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/RIESGOS_RESIDUALES.md', label: 'Riesgos residuales del piloto' },
      { path: 'docs/architecture/PILOTO_CONTROLADO/INCIDENCIAS_Y_RESOLUCIONES.md', label: 'Incidencias y resoluciones' },
      { path: 'tools/forensics/README.md', label: 'Caja forense' }
    ]
  },
  validators: {
    title: 'Validadores locales',
    intro: 'Chequeos seguros y verificaciones que ya existen en el repo.',
    items: [
      { path: 'scripts/validation/system-check.js', label: 'System check' },
      { path: 'scripts/validation/docs-check.js', label: 'Docs check' },
      { path: 'scripts/validation/links-check.js', label: 'Links check' },
      { path: 'scripts/validation/validate-firebase.js', label: 'Firebase files check' },
      { path: 'scripts/validation/doctor.js', label: 'Doctor general' },
      { path: 'scripts/validation/operational-doctor.js', label: 'Doctor operacional' },
      { path: 'scripts/validation/validate-operational-port.js', label: 'Puerto operativo' },
      { path: 'scripts/validation/validate-panels-pre-pilot.mjs', label: 'Paneles pre piloto' },
      { path: 'scripts/validation/validate-routes.js', label: 'Rutas' },
      { path: 'scripts/validation/validate-contracts.js', label: 'Contratos' },
      { path: 'scripts/validation/validate-data-model.js', label: 'Modelo de datos' },
      { path: 'scripts/validation/validate-admin-sync.js', label: 'Admin sync' },
      { path: 'scripts/validation/validate-order-sync.js', label: 'Order sync' }
    ]
  },
  legacy: {
    title: 'No usar en flujo',
    intro: 'Herramientas historicas o bypass que deben seguir visibles para evitar regresiones.',
    items: [
      { path: 'complete-order-fallback.js', label: 'Bypass complete-order fallback' },
      { path: 'simulate-accept-order.js', label: 'Simulador de accept-order' },
      { path: 'create-order-ready-complete.js', label: 'Creador directo de pedidos' },
      { path: 'scripts/generar-pedido-directo-reparto-rtdb.js', label: 'Generador directo a RTDB' }
    ]
  }
};

const COMMANDS = {
  index: 'Muestra el mapa completo del piloto.',
  check: 'Ejecuta chequeos locales seguros y el inventario de base.',
  doctor: 'Lanza scripts/validation/doctor.js.',
  operational: 'Lanza scripts/validation/operational-doctor.js.',
  ui: 'Ejecuta la validacion visual pre piloto con Playwright.',
  full: 'Corre check + doctor + operational + ui en secuencia.'
};

function relExists(relPath) {
  return fs.existsSync(path.join(ROOT, relPath));
}

function envStatus(name) {
  return process.env[name] ? 'SET' : 'MISSING';
}

function printHeader(title, subtitle = '') {
  console.log('');
  console.log(title);
  if (subtitle) console.log(subtitle);
  console.log('-'.repeat(Math.max(title.length, subtitle.length, 24)));
}

function printItems(group) {
  printHeader(group.title, group.intro);
  for (const item of group.items) {
    const ok = relExists(item.path);
    const status = ok ? 'OK' : 'MISS';
    console.log(`${status.padEnd(4)} ${item.label}`);
    console.log(`     ${item.path}`);
  }
}

function printEnvChecklist() {
  printHeader('Tokens / env', 'Variables utiles para auth y bootstrap.');
  for (const key of ENV_KEYS) {
    console.log(`${envStatus(key).padEnd(7)} ${key}`);
  }
  console.log(`${(relExists('nelly-admin.json') ? 'OK' : 'MISS').padEnd(7)} nelly-admin.json`);
}

function printQuickStart() {
  printHeader('Pilot toolbox', 'Entrada unica para flujo, tokens y errores.');
  console.log('Comandos:');
  for (const [command, description] of Object.entries(COMMANDS)) {
    console.log(`- ${command.padEnd(12)} ${description}`);
  }
  console.log('');
  console.log('NPM:');
  console.log('- npm run pilot:toolbox -- index');
  console.log('- npm run pilot:toolbox -- check');
  console.log('- npm run pilot:toolbox -- doctor');
  console.log('- npm run pilot:toolbox -- operational');
  console.log('- npm run pilot:toolbox -- ui');
  console.log('- npm run pilot:toolbox -- full');
}

function runNodeScript(scriptPath, extraArgs = [], options = {}) {
  const result = spawnSync(process.execPath, [scriptPath, ...extraArgs], {
    cwd: ROOT,
    stdio: options.inherit ? 'inherit' : 'pipe',
    encoding: 'utf8',
    env: process.env,
    maxBuffer: 10 * 1024 * 1024
  });

  if (!options.inherit) {
    if (result.stdout) process.stdout.write(result.stdout);
    if (result.stderr) process.stderr.write(result.stderr);
  }

  return {
    ok: result.status === 0,
    code: result.status ?? 1
  };
}

function runChecks() {
  const checks = [
    { name: 'system-check', script: 'scripts/validation/system-check.js' },
    { name: 'docs-check', script: 'scripts/validation/docs-check.js' },
    { name: 'links-check', script: 'scripts/validation/links-check.js' },
    { name: 'validate-firebase', script: 'scripts/validation/validate-firebase.js' },
    { name: 'short-id-certification', script: 'scripts/validation/short-id-certification-001.mjs' }
  ];

  printHeader('Check', 'Chequeos locales seguros.');
  let ok = true;
  for (const check of checks) {
    const result = runNodeScript(check.script);
    console.log(`${(result.ok ? 'OK' : 'FAIL').padEnd(6)} ${check.name}`);
    if (!result.ok) ok = false;
  }
  return ok;
}

function runDoctorMode(scriptPath, title) {
  printHeader(title, 'Ejecutando validador existente.');
  const result = runNodeScript(scriptPath, [], { inherit: true });
  return result.ok;
}

function printIndex() {
  printQuickStart();
  printEnvChecklist();
  printItems(GROUPS.flow);
  printItems(GROUPS.tokens);
  printItems(GROUPS.errors);
  printItems(GROUPS.validators);
  printItems(GROUPS.legacy);
}

function printHelp() {
  printQuickStart();
  console.log('');
  console.log('Uso:');
  console.log('  node scripts/pilot-toolbox.mjs [index|check|doctor|operational|ui|full]');
}

const command = String(process.argv[2] || 'index').toLowerCase();

let exitCode = 0;
switch (command) {
  case 'index':
    printIndex();
    break;
  case 'flow':
    printItems(GROUPS.flow);
    break;
  case 'tokens':
    printEnvChecklist();
    printItems(GROUPS.tokens);
    break;
  case 'errors':
    printItems(GROUPS.errors);
    break;
  case 'validators':
    printItems(GROUPS.validators);
    break;
  case 'legacy':
    printItems(GROUPS.legacy);
    break;
  case 'check':
    exitCode = runChecks() ? 0 : 1;
    break;
  case 'doctor':
    exitCode = runDoctorMode('scripts/validation/doctor.js', 'Doctor general') ? 0 : 1;
    break;
  case 'operational':
    exitCode = runDoctorMode('scripts/validation/operational-doctor.js', 'Doctor operacional') ? 0 : 1;
    break;
  case 'ui':
    exitCode = runDoctorMode('scripts/validation/validate-panels-pre-pilot.mjs', 'Validacion visual pre piloto') ? 0 : 1;
    break;
  case 'full':
    exitCode = runChecks() ? 0 : 1;
    if (exitCode === 0) exitCode = runDoctorMode('scripts/validation/doctor.js', 'Doctor general') ? 0 : 1;
    if (exitCode === 0) exitCode = runDoctorMode('scripts/validation/operational-doctor.js', 'Doctor operacional') ? 0 : 1;
    if (exitCode === 0) exitCode = runDoctorMode('scripts/validation/validate-panels-pre-pilot.mjs', 'Validacion visual pre piloto') ? 0 : 1;
    break;
  case 'help':
  case '--help':
  case '-h':
    printHelp();
    break;
  default:
    console.error(`Comando desconocido: ${command}`);
    printHelp();
    exitCode = 1;
    break;
}

process.exit(exitCode);
