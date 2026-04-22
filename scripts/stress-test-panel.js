const fs = require('fs');
const path = require('path');
const axios = require('axios');
const admin = require('firebase-admin');

const LIMITES = Object.freeze({
  BRONCE: 300,
  PLATA: 500,
  ORO: 600,
  DIAMANTE: 900,
});

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    drivers: 10,
    orders: 50,
    churnMs: 30000,
    churnIntervalMs: 300,
    concurrency: 25,
    rounds: 5,
    cleanup: false,
    seedOnly: false,
    out: '',
  };

  for (const arg of args) {
    if (!arg.startsWith('--')) continue;
    const [k, v = ''] = arg.replace(/^--/, '').split('=');
    if (k === 'help') {
      opts.help = true;
      continue;
    }
    if (k === 'cleanup') {
      opts.cleanup = true;
      continue;
    }
    if (k === 'seed-only') {
      opts.seedOnly = true;
      continue;
    }
    if (k === 'out') {
      opts.out = String(v || '').trim();
      continue;
    }
    if (['drivers', 'orders', 'churnMs', 'churnIntervalMs', 'concurrency', 'rounds'].includes(k)) {
      const n = Number(v);
      if (Number.isFinite(n) && n > 0) {
        opts[k] = n;
      }
    }
  }

  return opts;
}

function usage() {
  console.log('Uso: node scripts/stress-test-panel.js [opciones]');
  console.log('Opciones:');
  console.log('  --drivers=10            Cantidad de repartidores ficticios');
  console.log('  --orders=50             Cantidad de pedidos aleatorios');
  console.log('  --churnMs=30000         Duracion de simulacion de deuda/bloqueo');
  console.log('  --churnIntervalMs=300   Intervalo de mutacion de deuda');
  console.log('  --concurrency=25        Concurrencia por ronda para endpoint admin');
  console.log('  --rounds=5              Numero de rondas de carga concurrente');
  console.log('  --seed-only             Solo siembra datos, sin carga HTTP');
  console.log('  --cleanup               Limpia stress_* al finalizar');
  console.log('  --out=./ruta.json       Guarda resultado final en archivo JSON');
  console.log('Variables recomendadas:');
  console.log('  FIREBASE_ADMIN_JSON | ./nelly-admin.json');
  console.log('  FIREBASE_DATABASE_URL (opcional)');
  console.log('  RENDER_BASE_URL (default https://nelly-api-8lh1.onrender.com)');
  console.log('  FIREBASE_WEB_API_KEY (obligatoria para prueba endpoint admin)');
  console.log('  ADMIN_UID (default 42aUFDp3rwdczecmUgnig4BTFZY2)');
}

function parseServiceAccountFromEnv() {
  const raw = process.env.FIREBASE_ADMIN_JSON;
  if (!raw) return null;
  return raw.trim().startsWith('{')
    ? JSON.parse(raw)
    : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
}

function parseServiceAccountFromFile(filePath) {
  const absolutePath = path.resolve(filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`No existe el archivo de credenciales: ${absolutePath}`);
  }
  const content = fs.readFileSync(absolutePath, 'utf8');
  return JSON.parse(content);
}

function getServiceAccount() {
  const fromEnv = parseServiceAccountFromEnv();
  if (fromEnv) return fromEnv;

  const defaultPaths = [
    '/etc/secrets/nelly-admin.json',
    './nelly-admin.json',
    './serviceAccountKey.json',
  ];

  for (const candidate of defaultPaths) {
    try {
      return parseServiceAccountFromFile(candidate);
    } catch (_) {
      // Continuar
    }
  }

  throw new Error('No se encontraron credenciales Firebase Admin');
}

function randomFrom(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function now() {
  return Date.now();
}

function randomDebt(max) {
  return Math.round((Math.random() * max + Number.EPSILON) * 100) / 100;
}

function buildDriver(index) {
  const niveles = ['BRONCE', 'PLATA', 'ORO', 'DIAMANTE'];
  const nivel = niveles[index % niveles.length];
  const limite = LIMITES[nivel];
  const deudaActual = randomDebt(limite * 1.3);
  const bloqueado = deudaActual > limite;
  const uid = `stress_driver_${String(index + 1).padStart(2, '0')}`;

  return {
    uid,
    data: {
      nombre: `Stress Driver ${index + 1}`,
      uid,
      estatus: {
        nivel,
        bloqueado_por_deuda: bloqueado,
        bloqueo_manual: false,
        updated_at: now(),
      },
      perfil: {
        bloqueado_por_deuda: bloqueado,
      },
      finanzas: {
        deuda_actual: deudaActual,
        limite_deuda: limite,
        saldo_ganancias: 0,
      },
      bloqueado_por_deuda: bloqueado,
      stress_test: true,
    },
  };
}

function buildOrder(index, driverUids) {
  const assigned = Math.random() < 0.4;
  const repartidorId = assigned ? randomFrom(driverUids) : null;
  const status = assigned ? 'en_reparto' : 'pendiente';
  const id = `stress_order_${String(index + 1).padStart(3, '0')}_${now()}_${Math.floor(Math.random() * 9999)}`;

  return {
    id,
    data: {
      id_pedido: id,
      cliente_nombre: `Cliente Stress ${index + 1}`,
      telefono: `999000${String(index).padStart(4, '0')}`,
      direccion: `Zona ${1 + (index % 12)} Tuxtla - stress test`,
      monto: Math.round((50 + Math.random() * 300) * 100) / 100,
      descripcion: 'STRESS TEST PANEL - NO DESPACHAR',
      origen: 'stress_test',
      created_at: now(),
      logistica: {
        estado: status,
        repartidor_id: repartidorId,
        manual: false,
      },
      stress_test: true,
    },
  };
}

async function seedData(db, driversCount, ordersCount) {
  const drivers = [];
  const orders = [];
  const updates = {};

  for (let i = 0; i < driversCount; i += 1) {
    const d = buildDriver(i);
    drivers.push(d);
    updates[`repartidores/${d.uid}`] = d.data;
  }

  const driverUids = drivers.map((d) => d.uid);
  for (let i = 0; i < ordersCount; i += 1) {
    const o = buildOrder(i, driverUids);
    orders.push(o);
    updates[`pedidos_activos/${o.id}`] = o.data;
  }

  await db.ref().update(updates);
  return { drivers, orders };
}

async function runDebtChurn(db, drivers, totalMs, intervalMs) {
  const start = Date.now();
  let mutations = 0;

  while (Date.now() - start < totalMs) {
    const selected = randomFrom(drivers);
    const ref = db.ref(`repartidores/${selected.uid}`);

    // Transaccion para simular cambios rapidos de deuda y bloqueo sin romper consistencia.
    await ref.transaction((current) => {
      if (!current || typeof current !== 'object') return current;
      const nivel = String(current?.estatus?.nivel || 'BRONCE').toUpperCase();
      const limite = LIMITES[nivel] || 300;
      const deudaActual = Number(current?.finanzas?.deuda_actual || 0);
      const delta = Math.round(((Math.random() * 140) - 60) * 100) / 100;
      const nuevaDeuda = Math.max(0, Math.round((deudaActual + delta + Number.EPSILON) * 100) / 100);
      const bloqueado = nuevaDeuda > limite;

      return {
        ...current,
        estatus: {
          ...(current.estatus || {}),
          nivel,
          bloqueado_por_deuda: bloqueado,
          updated_at: now(),
        },
        perfil: {
          ...(current.perfil || {}),
          bloqueado_por_deuda: bloqueado,
        },
        finanzas: {
          ...(current.finanzas || {}),
          deuda_actual: nuevaDeuda,
          limite_deuda: limite,
        },
        bloqueado_por_deuda: bloqueado,
      };
    });

    mutations += 1;
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }

  return { mutations, durationMs: Date.now() - start };
}

async function createAdminIdToken(firebaseWebApiKey, adminUid) {
  const customToken = await admin.auth().createCustomToken(adminUid);
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${firebaseWebApiKey}`;
  const response = await axios.post(url, {
    token: customToken,
    returnSecureToken: true,
  });
  return response.data.idToken;
}

function percentile(values, p) {
  if (!values.length) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const idx = Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length));
  return sorted[idx];
}

async function runEndpointLoadTest({ baseUrl, token, concurrency, rounds }) {
  const latencies = [];
  let ok = 0;
  let errors = 0;

  for (let r = 0; r < rounds; r += 1) {
    const tasks = Array.from({ length: concurrency }, async () => {
      const t0 = Date.now();
      try {
        const response = await axios.get(`${baseUrl}/api/admin/repartidores`, {
          headers: { Authorization: `Bearer ${token}` },
          timeout: 12000,
        });
        latencies.push(Date.now() - t0);
        if (response.status === 200) {
          ok += 1;
          return;
        }
        errors += 1;
      } catch (_) {
        latencies.push(Date.now() - t0);
        errors += 1;
      }
    });

    await Promise.all(tasks);
  }

  const total = ok + errors;
  return {
    total,
    ok,
    errors,
    errorRatePct: total > 0 ? Number(((errors / total) * 100).toFixed(2)) : 0,
    p50Ms: percentile(latencies, 50),
    p95Ms: percentile(latencies, 95),
    p99Ms: percentile(latencies, 99),
  };
}

async function cleanupStressData(db) {
  const [driversSnap, ordersSnap] = await Promise.all([
    db.ref('repartidores').once('value'),
    db.ref('pedidos_activos').once('value'),
  ]);

  const updates = {};
  const drivers = driversSnap.val() || {};
  const orders = ordersSnap.val() || {};
  let removedDrivers = 0;
  let removedOrders = 0;

  for (const uid of Object.keys(drivers)) {
    if (String(uid).startsWith('stress_driver_') || drivers[uid]?.stress_test === true) {
      updates[`repartidores/${uid}`] = null;
      removedDrivers += 1;
    }
  }

  for (const orderId of Object.keys(orders)) {
    const order = orders[orderId] || {};
    if (String(orderId).startsWith('stress_order_') || order.stress_test === true) {
      updates[`pedidos_activos/${orderId}`] = null;
      removedOrders += 1;
    }
  }

  if (Object.keys(updates).length > 0) {
    await db.ref().update(updates);
  }

  return { removedDrivers, removedOrders };
}

async function main() {
  const opts = parseArgs();
  if (opts.help) {
    usage();
    return;
  }

  const serviceAccount = getServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
  const baseUrl = (process.env.RENDER_BASE_URL || process.env.RENDER_URL || 'https://nelly-api-8lh1.onrender.com').replace(/\/+$/, '');
  const firebaseWebApiKey = String(process.env.FIREBASE_WEB_API_KEY || '').trim();
  const adminUid = String(process.env.ADMIN_UID || '42aUFDp3rwdczecmUgnig4BTFZY2').trim();

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  const db = admin.database();

  console.log('[STRESS] Pre-limpieza de residuos stress_*...');
  const preCleanup = await cleanupStressData(db);
  console.log(`[STRESS] Residuos eliminados antes de sembrar => drivers: ${preCleanup.removedDrivers}, orders: ${preCleanup.removedOrders}`);

  console.log('[STRESS] Sembrando datos de prueba...');
  const seeded = await seedData(db, opts.drivers, opts.orders);
  console.log(`[STRESS] Repartidores creados: ${seeded.drivers.length}, pedidos creados: ${seeded.orders.length}`);

  console.log('[STRESS] Simulando variaciones rapidas de deuda/bloqueo...');
  const churnResult = await runDebtChurn(db, seeded.drivers, opts.churnMs, opts.churnIntervalMs);

  let loadTest = null;
  if (!opts.seedOnly) {
    if (!firebaseWebApiKey) {
      throw new Error('FIREBASE_WEB_API_KEY es obligatoria para la prueba concurrente del endpoint admin');
    }
    console.log('[STRESS] Generando token admin y lanzando carga concurrente...');
    const idToken = await createAdminIdToken(firebaseWebApiKey, adminUid);
    loadTest = await runEndpointLoadTest({
      baseUrl,
      token: idToken,
      concurrency: opts.concurrency,
      rounds: opts.rounds,
    });
  }

  let cleanupResult = null;
  if (opts.cleanup) {
    console.log('[STRESS] Limpiando datos stress_*...');
    cleanupResult = await cleanupStressData(db);
  }

  const result = {
    preCleanup,
    seededDrivers: seeded.drivers.length,
    seededOrders: seeded.orders.length,
    churn: churnResult,
    endpointLoad: loadTest,
    cleanup: cleanupResult,
  };

  if (opts.out) {
    const absoluteOut = path.resolve(opts.out);
    fs.mkdirSync(path.dirname(absoluteOut), { recursive: true });
    fs.writeFileSync(absoluteOut, JSON.stringify(result, null, 2), 'utf8');
    console.log(`[STRESS] Resultado guardado en: ${absoluteOut}`);
  }

  console.log('[STRESS] Resultado final:');
  console.log(JSON.stringify(result, null, 2));
}

main().catch((error) => {
  console.error('[STRESS] Error:', error.message);
  process.exit(1);
});
