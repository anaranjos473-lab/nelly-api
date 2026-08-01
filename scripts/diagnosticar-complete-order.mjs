import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

let BASE_URL = 'http://localhost:3001';
let PEDIDO_ID = `DIAG_COMPLETE_${Date.now()}`;
let DRIVER_UID = 'driver_diag_complete';
let PANEL_UID = 'panel-admin';
let FIREBASE_API_KEY = '';
let AUTH_BOOTSTRAP_TOKEN = '';
const DEFAULT_FIREBASE_API_KEY = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const REQUEST_TIMEOUT_MS = Number(process.env.DIAG_REQUEST_TIMEOUT_MS || 15000);
const RTDB_TIMEOUT_MS = Number(process.env.DIAG_RTDB_TIMEOUT_MS || 15000);

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return;

  for (const rawLine of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim();
    }
  }
}

function loadServiceAccount() {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    return JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  }

  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }

  throw new Error('No se encontro nelly-admin.json ni FIREBASE_SERVICE_ACCOUNT');
}

async function requestRaw(label, url, options = {}) {
  const startedAt = Date.now();
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;
  try {
    response = await fetch(url, { ...options, signal: controller.signal });
  } catch (error) {
    return {
      label,
      ok: false,
      networkError: error.name === 'AbortError' ? `timeout ${REQUEST_TIMEOUT_MS}ms` : (error.cause?.message || error.message),
      durationMs: Date.now() - startedAt
    };
  } finally {
    clearTimeout(timeout);
  }

  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = { raw: text };
  }

  return {
    label,
    ok: response.ok,
    status: response.status,
    statusText: response.statusText,
    body,
    durationMs: Date.now() - startedAt
  };
}

function createTraceId() {
  return `RUNNER-${Date.now()}-${Math.random().toString(16).slice(2, 8)}`;
}

function nowIso() {
  return new Date().toISOString();
}

async function traceStep(traceId, stepName, fn) {
  const startedAt = Date.now();
  const startedPerf = process.hrtime.bigint();
  console.log(`[RUNNER][${traceId}] ${stepName} START`, {
    ts: nowIso(),
    perf_now_ms: Number(startedPerf) / 1e6
  });
  try {
    const result = await fn();
    const endedPerf = process.hrtime.bigint();
    console.log(`[RUNNER][${traceId}] ${stepName} END`, {
      ts: nowIso(),
      perf_now_ms: Number(endedPerf) / 1e6,
      duration_ms: Number(endedPerf - startedPerf) / 1e6,
      duration_wall_ms: Date.now() - startedAt
    });
    return result;
  } catch (error) {
    const endedPerf = process.hrtime.bigint();
    console.log(`[RUNNER][${traceId}] ${stepName} ERROR`, {
      ts: nowIso(),
      perf_now_ms: Number(endedPerf) / 1e6,
      duration_ms: Number(endedPerf - startedPerf) / 1e6,
      duration_wall_ms: Date.now() - startedAt,
      error: error?.message || String(error)
    });
    throw error;
  }
}

function failFastResult(traceId, label, result) {
  if (result?.ok) return;
  const error = {
    ok: false,
    traceId,
    fase: label,
    http: result?.status ?? null,
    statusText: result?.statusText ?? null,
    networkError: result?.networkError ?? null,
    body: redactBody(result?.body ?? null),
    durationMs: result?.durationMs ?? null
  };
  console.log(JSON.stringify(error, null, 2));
  process.exit(1);
}

async function withTimeout(label, promise, ms) {
  let timeout;
  try {
    return await Promise.race([
      promise,
      new Promise((_, reject) => {
        timeout = setTimeout(() => reject(new Error(`${label} timeout ${ms}ms`)), ms);
      })
    ]);
  } finally {
    clearTimeout(timeout);
  }
}

function redactBody(body) {
  if (!body || typeof body !== 'object') return body;
  return Object.fromEntries(Object.entries(body).map(([key, value]) => {
    if (key.toLowerCase().includes('token')) {
      return [key, `[redacted:${String(value || '').length}]`];
    }
    return [key, value];
  }));
}

function redactStep(step) {
  if (!step || typeof step !== 'object') return step;
  return {
    ...step,
    body: redactBody(step.body)
  };
}

async function exchangeCustomToken(customToken) {
  if (!FIREBASE_API_KEY) {
    return { mode: 'custom-token-unexchanged', token: customToken };
  }

  const result = await requestRaw(
    'exchange-custom-token',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );

  if (!result.ok || !result.body?.idToken) {
    throw new Error(`No se pudo intercambiar custom token: ${JSON.stringify(result)}`);
  }

  return { mode: 'firebase-id-token', token: result.body.idToken, uid: result.body.localId };
}

async function resolveFirebaseApiKey() {
  if (FIREBASE_API_KEY) return FIREBASE_API_KEY;

  const result = await requestRaw('firebase-config', `${BASE_URL}/api/public/firebase-config`);
  const apiKey = result.body?.apiKey || DEFAULT_FIREBASE_API_KEY;
  if (!result.ok || !apiKey) {
    throw new Error(`No se pudo resolver FIREBASE_API_KEY: ${JSON.stringify(result)}`);
  }
  FIREBASE_API_KEY = apiKey;
  return FIREBASE_API_KEY;
}

async function getBootstrapToken(kind, uid) {
  const query = new URLSearchParams({ uid });
  if (AUTH_BOOTSTRAP_TOKEN) query.set('token', AUTH_BOOTSTRAP_TOKEN);

  const result = await requestRaw(
    `${kind}-token`,
    `${BASE_URL}/api/auth/${kind}-token?${query.toString()}`,
    { method: 'GET', headers: AUTH_BOOTSTRAP_TOKEN ? { 'x-auth-bootstrap-token': AUTH_BOOTSTRAP_TOKEN } : {} }
  );

  const rawToken = result.body?.token || null;
  if (!result.ok || !rawToken) {
    throw new Error(`No se pudo obtener ${kind}-token: ${JSON.stringify(result)}`);
  }

  result.rawToken = rawToken;
  return result;
}

async function snapshot(db, pedidoId, driverUid) {
  const [pedido, activo, enCamino] = await Promise.all([
    withTimeout(`pedidos/${pedidoId}`, db.ref(`pedidos/${pedidoId}`).once('value'), RTDB_TIMEOUT_MS),
    withTimeout(`repartidores/${driverUid}/pedido_activo`, db.ref(`repartidores/${driverUid}/pedido_activo`).once('value'), RTDB_TIMEOUT_MS),
    withTimeout(`pedidos_en_camino/${pedidoId}`, db.ref(`pedidos_en_camino/${pedidoId}`).once('value'), RTDB_TIMEOUT_MS)
  ]);

  return {
    pedido: pedido.val(),
    pedido_activo: activo.exists() ? activo.val() : null,
    pedidos_en_camino: enCamino.val()
  };
}

function headers(token) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`
  };
}

async function main() {
  const traceId = createTraceId();
  console.log(`[RUNNER][${traceId}] RUNNER START`, {
    ts: nowIso(),
    pid: process.pid
  });
  console.error('[diag] loading env');
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  BASE_URL = process.env.LOCAL_BASE || process.env.BASE_URL || BASE_URL;
  PEDIDO_ID = process.env.PEDIDO_ID || PEDIDO_ID;
  DRIVER_UID = process.env.DRIVER_UID || DRIVER_UID;
  PANEL_UID = process.env.PANEL_UID || process.env.PANEL_BOOTSTRAP_UID || PANEL_UID;
  FIREBASE_API_KEY = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || FIREBASE_API_KEY;
  AUTH_BOOTSTRAP_TOKEN = process.env.AUTH_BOOTSTRAP_TOKEN || AUTH_BOOTSTRAP_TOKEN;

  await traceStep(traceId, 'ENV LOAD', async () => {
    return {
      baseUrl: BASE_URL,
      pedidoId: PEDIDO_ID,
      driverUid: DRIVER_UID,
      panelUid: PANEL_UID
    };
  });

  await traceStep(traceId, 'FIREBASE ADMIN INIT', async () => {
    if (!admin.apps.length) {
      const serviceAccount = loadServiceAccount();
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
      });
    }
    return true;
  });

  const db = admin.database();
  const steps = [];

  const apiKey = await traceStep(traceId, 'RESOLVE FIREBASE API KEY', async () => resolveFirebaseApiKey());
  FIREBASE_API_KEY = apiKey;

  const panelBootstrap = await traceStep(traceId, 'GET PANEL BOOTSTRAP TOKEN', async () => getBootstrapToken('panel', PANEL_UID));
  const driverBootstrap = await traceStep(traceId, 'GET DRIVER BOOTSTRAP TOKEN', async () => getBootstrapToken('driver', DRIVER_UID));

  const panelAuth = await traceStep(traceId, 'EXCHANGE PANEL CUSTOM TOKEN', async () => exchangeCustomToken(panelBootstrap.rawToken));
  const driverAuth = await traceStep(traceId, 'EXCHANGE DRIVER CUSTOM TOKEN', async () => exchangeCustomToken(driverBootstrap.rawToken));
  delete panelBootstrap.rawToken;
  delete driverBootstrap.rawToken;

  steps.push(panelBootstrap);
  steps.push(driverBootstrap);
  steps.push({ label: 'auth-mode', panel: panelAuth.mode, driver: driverAuth.mode, panelUid: panelAuth.uid || PANEL_UID, driverUid: driverAuth.uid || DRIVER_UID });

  const pedido = {
    id: PEDIDO_ID,
    id_pedido: PEDIDO_ID,
    pedido_id: PEDIDO_ID,
    cliente_nombre: 'Diagnostico complete-order',
    descripcion: 'Pedido temporal de certificacion complete-order',
    direccion: 'Tuxtla Gutierrez',
    telefono: '9610000000',
    monto_total: 180,
    monto: 180,
    estado: 'PENDIENTE',
    estado_pedido: 'PENDIENTE'
  };

  await traceStep(traceId, `SET RTDB pedidos/${PEDIDO_ID}`, async () => {
    await withTimeout(`set pedidos/${PEDIDO_ID}`, db.ref(`pedidos/${PEDIDO_ID}`).set(pedido), RTDB_TIMEOUT_MS);
  });

  steps.push(await traceStep(traceId, 'SNAPSHOT CREATED', async () => snapshot(db, PEDIDO_ID, DRIVER_UID)));

  const dispatch = await traceStep(traceId, 'REQUEST dispatch-order', async () => requestRaw('dispatch-order', `${BASE_URL}/api/delivery/dispatch-order`, {
    method: 'POST',
    headers: headers(panelAuth.token),
    body: JSON.stringify({ pedidoId: PEDIDO_ID, pedido })
  }));
  steps.push(dispatch);
  failFastResult(traceId, 'dispatch-order', dispatch);

  const accept = await traceStep(traceId, 'REQUEST accept-order', async () => requestRaw('accept-order', `${BASE_URL}/api/delivery/accept-order`, {
    method: 'POST',
    headers: headers(driverAuth.token),
    body: JSON.stringify({ pedidoId: PEDIDO_ID })
  }));
  steps.push(accept);
  failFastResult(traceId, 'accept-order', accept);

  steps.push(await traceStep(traceId, 'SNAPSHOT BEFORE COMPLETE', async () => snapshot(db, PEDIDO_ID, DRIVER_UID)));

  const complete = await traceStep(traceId, 'REQUEST complete-order', async () => requestRaw('complete-order', `${BASE_URL}/api/delivery/complete-order`, {
    method: 'POST',
    headers: headers(panelAuth.token),
    body: JSON.stringify({ pedidoId: PEDIDO_ID })
  }));
  steps.push(complete);
  failFastResult(traceId, 'complete-order', complete);

  const finalState = await traceStep(traceId, 'SNAPSHOT AFTER COMPLETE', async () => snapshot(db, PEDIDO_ID, DRIVER_UID));
  steps.push({ label: 'snapshot-after-complete', state: finalState });

  const cierre = {
    completeOrder200: complete.status === 200,
    pedidoEntregado: finalState.pedido?.estado === 'ENTREGADO' && finalState.pedido?.estado_pedido === 'ENTREGADO',
    pedidoActivoNull: finalState.pedido_activo === null,
    pedidosEnCaminoLimpio: finalState.pedidos_en_camino === null,
    panelPuedeMostrarExito: complete.ok === true
  };

  console.log(JSON.stringify({
    ok: Object.values(cierre).every(Boolean),
    traceId,
    baseUrl: BASE_URL,
    pedidoId: PEDIDO_ID,
    driverUid: DRIVER_UID,
    cierre,
    steps: steps.map(redactStep)
  }, null, 2));

  if (!Object.values(cierre).every(Boolean)) {
    process.exit(1);
  }

  await traceStep(traceId, 'ADMIN DELETE', async () => admin.app().delete());
  console.log(`[RUNNER][${traceId}] RUNNER END`, {
    ts: nowIso(),
    pid: process.pid
  });
  process.exit(0);
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, error: error.message, stack: error.stack }, null, 2));
  if (admin.apps.length) {
    admin.app().delete().finally(() => process.exit(1));
  } else {
    process.exit(1);
  }
});
