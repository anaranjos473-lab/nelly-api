import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

const DEFAULT_BASE_URL = 'https://nelly-api-8lh1.onrender.com';
const DEFAULT_FIREBASE_API_KEY = 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const STATE_PATH = path.join(process.cwd(), '.codex-tmp', 'pedido-c-state.json');

const STEP = String(process.env.STEP || process.argv[2] || 'inspect').toLowerCase();
const BASE_URL = process.env.BASE_URL || process.env.RENDER_URL || DEFAULT_BASE_URL;
const ADMIN_UID = process.env.ADMIN_UID || '42aUFDp3rwdczecmUgnig4BTFZY2';
const ADMIN_EMAILS = String(process.env.ADMIN_EMAIL || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
  .split(',')
  .map((email) => email.trim())
  .filter(Boolean);
const DRIVER_EMAIL = process.env.DRIVER_EMAIL || 'driver-tuxtla-001@nelly.com';
const DRIVER_PASSWORD = process.env.DRIVER_PASSWORD || 'Nelly2026#';

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
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (fs.existsSync(localPath)) {
    return JSON.parse(fs.readFileSync(localPath, 'utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

function readState() {
  if (!fs.existsSync(STATE_PATH)) return {};
  return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
}

function writeState(state) {
  fs.mkdirSync(path.dirname(STATE_PATH), { recursive: true });
  fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2));
}

async function requestRaw(label, url, options = {}) {
  const startedAt = Date.now();
  let response;
  try {
    response = await fetch(url, options);
  } catch (error) {
    return {
      label,
      ok: false,
      networkError: error.cause?.message || error.message,
      durationMs: Date.now() - startedAt
    };
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

async function requestJson(label, url, options = {}) {
  const result = await requestRaw(label, url, options);
  if (!result.ok) {
    throw new Error(`${label} -> ${result.status || 'NETWORK'} ${JSON.stringify(result.body || result.networkError)}`);
  }
  return result;
}

async function exchangeCustomToken(apiKey, customToken) {
  const result = await requestJson(
    'exchange-custom-token',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );
  if (!result.body?.idToken) throw new Error('No se pudo obtener ID Token Firebase');
  return result.body.idToken;
}

async function signInDriver(apiKey) {
  const result = await requestJson(
    'driver-signin',
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: DRIVER_EMAIL, password: DRIVER_PASSWORD, returnSecureToken: true })
    }
  );
  return {
    uid: result.body.localId,
    idToken: result.body.idToken
  };
}

async function resolveApiKey() {
  const result = await requestRaw('firebase-config', `${BASE_URL}/api/public/firebase-config`);
  return result.body?.apiKey || process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || DEFAULT_FIREBASE_API_KEY;
}

async function createAdminIdToken(apiKey) {
  let adminUser = null;
  for (const email of ADMIN_EMAILS) {
    try {
      adminUser = await admin.auth().getUserByEmail(email);
      break;
    } catch {}
  }
  if (!adminUser && ADMIN_UID) {
    try {
      adminUser = await admin.auth().getUser(ADMIN_UID);
    } catch {}
  }
  if (!adminUser) {
    throw new Error(`No se encontro usuario admin con emails: ${ADMIN_EMAILS.join(', ')} ni uid: ${ADMIN_UID}`);
  }
  const customToken = await admin.auth().createCustomToken(adminUser.uid, { admin: true, panel: true });
  return exchangeCustomToken(apiKey, customToken);
}

function authHeaders(idToken) {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${idToken}`
  };
}

function estadoPedido(pedido) {
  return String(pedido?.estado_pedido || pedido?.estado || '').trim().toUpperCase();
}

function estadoLogistica(pedido) {
  return String(pedido?.logistica?.estado || '').trim().toUpperCase();
}

async function snapshot(db, pedidoId, driverUid = null) {
  const refs = [
    db.ref(`pedidos/${pedidoId}`).once('value'),
    db.ref(`pedidos_para_reparto/${pedidoId}`).once('value'),
    db.ref(`pedidos_en_camino/${pedidoId}`).once('value')
  ];
  if (driverUid) {
    refs.push(db.ref(`repartidores/${driverUid}/pedido_activo`).once('value'));
  }
  const [pedidoSnap, repartoSnap, caminoSnap, activoSnap] = await Promise.all(refs);
  return {
    pedido: pedidoSnap.val(),
    pedidos_para_reparto: repartoSnap.val(),
    pedidos_en_camino: caminoSnap.val(),
    pedido_activo: activoSnap ? (activoSnap.exists() ? activoSnap.val() : null) : undefined,
    resumen: {
      estadoPedido: estadoPedido(pedidoSnap.val()),
      estadoLogistica: estadoLogistica(pedidoSnap.val()),
      enCocina: estadoPedido(pedidoSnap.val()) === 'PENDIENTE',
      listoReparto: estadoPedido(pedidoSnap.val()) === 'LISTO' && repartoSnap.exists(),
      enCamino: estadoPedido(pedidoSnap.val()) === 'EN_CURSO' && estadoLogistica(pedidoSnap.val()) === 'EN_CURSO' && caminoSnap.exists(),
      entregado: estadoPedido(pedidoSnap.val()) === 'ENTREGADO' && estadoLogistica(pedidoSnap.val()) === 'ENTREGADO',
      caminoLimpio: !caminoSnap.exists()
    }
  };
}

function buildOrderPayload() {
  const suffix = new Date().toISOString().replace(/[-:.TZ]/g, '').slice(0, 14);
  return {
    cliente_nombre: `Pedido C Campo ${suffix}`,
    telefono: '9610000000',
    direccion: 'Ruta certificacion Pedido C, Tuxtla Gutierrez',
    cliente_lat: 16.75213,
    cliente_lng: -93.1167,
    tienda_lat: 16.75146,
    tienda_lng: -93.11742,
    monto: 183,
    items: [
      { nombre: 'Combo certificacion campo', cantidad: 1, precio: 150 }
    ],
    subtotal: 150,
    costo_envio: 30,
    propina: 3,
    total: 183,
    pago: {
      metodo: 'efectivo',
      estado: 'pendiente'
    },
    descripcion: 'Certificacion campo Pedido C: admin -> cocina -> reparto -> Android -> entrega'
  };
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
    });
  }

  const db = admin.database();
  const apiKey = await resolveApiKey();
  const state = readState();
  const result = {
    ok: false,
    step: STEP,
    baseUrl: BASE_URL,
    timestamp: new Date().toISOString()
  };

  if (STEP === 'crear-admin') {
    const adminIdToken = await createAdminIdToken(apiKey);
    const createResult = await requestJson(`${STEP}:POST /api/admin/pedidos`, `${BASE_URL}/api/admin/pedidos`, {
      method: 'POST',
      headers: authHeaders(adminIdToken),
      body: JSON.stringify(buildOrderPayload())
    });
    const pedidoId = createResult.body?.id || createResult.body?.pedido?.id_pedido;
    const snap = await snapshot(db, pedidoId);
    const nextState = {
      ...state,
      pedidoId,
      createdAt: result.timestamp,
      baseUrl: BASE_URL,
      lastStep: STEP,
      lastSnapshot: snap
    };
    writeState(nextState);
    Object.assign(result, {
      ok: true,
      pedidoId,
      http: createResult,
      snapshot: snap,
      conclusion: snap.resumen.enCocina
        ? 'Pedido creado por /api/admin/pedidos y visible en cocina como PENDIENTE.'
        : 'Pedido creado, pero no quedo en estado de cocina esperado.'
    });
  } else if (STEP === 'despachar') {
    if (!state.pedidoId) throw new Error('No hay pedidoId en .codex-tmp/pedido-c-state.json');
    const adminIdToken = await createAdminIdToken(apiKey);
    const dispatchResult = await requestJson(`${STEP}:POST /api/delivery/dispatch-order`, `${BASE_URL}/api/delivery/dispatch-order`, {
      method: 'POST',
      headers: authHeaders(adminIdToken),
      body: JSON.stringify({ pedidoId: state.pedidoId })
    });
    const snap = await snapshot(db, state.pedidoId);
    writeState({ ...state, lastStep: STEP, dispatchedAt: result.timestamp, lastSnapshot: snap });
    Object.assign(result, {
      ok: true,
      pedidoId: state.pedidoId,
      http: dispatchResult,
      snapshot: snap,
      conclusion: snap.resumen.listoReparto
        ? 'Pedido movido por /api/delivery/dispatch-order a LISTO y publicado en pedidos_para_reparto.'
        : 'Despacho respondio, pero RTDB no quedo en LISTO/pedidos_para_reparto esperado.'
    });
  } else if (STEP === 'preparar-android') {
    if (!state.pedidoId) throw new Error('No hay pedidoId en .codex-tmp/pedido-c-state.json');
    const adminIdToken = await createAdminIdToken(apiKey);
    const driver = await signInDriver(apiKey);
    const publishedAt = Date.now();
    const compatPayload = {
      idConductor: driver.uid,
      fecha: publishedAt,
      cliente_direccion: 'Ruta certificacion Pedido C, Tuxtla Gutierrez',
      tienda_nombre: 'Cocina certificacion Pedido C',
      tienda_direccion: 'Cocina certificacion Pedido C, Tuxtla Gutierrez',
      ganancia: 36,
      tarifa_entrega: 36
    };
    const dispatchResult = await requestJson(`${STEP}:POST /api/delivery/dispatch-order`, `${BASE_URL}/api/delivery/dispatch-order`, {
      method: 'POST',
      headers: authHeaders(adminIdToken),
      body: JSON.stringify({
        pedidoId: state.pedidoId,
        pedido: compatPayload
      })
    });
    const snap = await snapshot(db, state.pedidoId, driver.uid);
    writeState({
      ...state,
      driverUid: driver.uid,
      androidPreparedAt: result.timestamp,
      lastStep: STEP,
      lastSnapshot: snap
    });
    Object.assign(result, {
      ok: true,
      pedidoId: state.pedidoId,
      driverUid: driver.uid,
      compatPayload,
      http: dispatchResult,
      snapshot: snap,
      conclusion: snap.resumen.listoReparto && snap.pedidos_para_reparto?.idConductor === driver.uid
        ? 'Pedido re-publicado por endpoint operativo con campos de compatibilidad que Android consulta.'
        : 'Re-publicacion respondio, pero faltan campos de compatibilidad Android en RTDB.'
    });
  } else if (STEP === 'aceptar-api') {
    if (!state.pedidoId) throw new Error('No hay pedidoId en .codex-tmp/pedido-c-state.json');
    const driver = await signInDriver(apiKey);
    const acceptResult = await requestJson(`${STEP}:POST /api/delivery/accept-order`, `${BASE_URL}/api/delivery/accept-order`, {
      method: 'POST',
      headers: authHeaders(driver.idToken),
      body: JSON.stringify({ pedidoId: state.pedidoId })
    });
    const snap = await snapshot(db, state.pedidoId, driver.uid);
    writeState({ ...state, driverUid: driver.uid, lastStep: STEP, acceptedAt: result.timestamp, lastSnapshot: snap });
    Object.assign(result, {
      ok: true,
      pedidoId: state.pedidoId,
      driverUid: driver.uid,
      http: acceptResult,
      snapshot: snap,
      conclusion: snap.resumen.enCamino
        ? 'Pedido aceptado por driver API, pasa a EN_CURSO, sale de pedidos_para_reparto y entra a pedidos_en_camino.'
        : 'Aceptacion respondio, pero RTDB no quedo en EN_CURSO/pedidos_en_camino esperado.'
    });
  } else if (STEP === 'completar-api') {
    if (!state.pedidoId) throw new Error('No hay pedidoId en .codex-tmp/pedido-c-state.json');
    const driver = await signInDriver(apiKey);
    const completeResult = await requestJson(`${STEP}:POST /api/delivery/complete-order`, `${BASE_URL}/api/delivery/complete-order`, {
      method: 'POST',
      headers: authHeaders(driver.idToken),
      body: JSON.stringify({ pedidoId: state.pedidoId })
    });
    const snap = await snapshot(db, state.pedidoId, driver.uid);
    writeState({ ...state, driverUid: driver.uid, lastStep: STEP, completedAt: result.timestamp, lastSnapshot: snap });
    Object.assign(result, {
      ok: true,
      pedidoId: state.pedidoId,
      driverUid: driver.uid,
      http: completeResult,
      snapshot: snap,
      conclusion: snap.resumen.entregado && snap.pedido_activo === null && snap.resumen.caminoLimpio
        ? 'Pedido ENTREGADO, pedido_activo limpio y pedidos_en_camino eliminado.'
        : 'Complete-order respondio, pero falta limpiar algun estado final.'
    });
  } else if (STEP === 'inspect') {
    if (!state.pedidoId) throw new Error('No hay pedidoId en .codex-tmp/pedido-c-state.json');
    const snap = await snapshot(db, state.pedidoId, state.driverUid || null);
    writeState({ ...state, lastStep: STEP, inspectedAt: result.timestamp, lastSnapshot: snap });
    Object.assign(result, {
      ok: true,
      pedidoId: state.pedidoId,
      driverUid: state.driverUid || null,
      snapshot: snap,
      conclusion: 'Snapshot RTDB capturado sin modificar estado.'
    });
  } else {
    throw new Error(`STEP no soportado: ${STEP}`);
  }

  console.log(JSON.stringify(result, null, 2));
  await admin.app().delete();
}

main().catch(async (error) => {
  console.error(JSON.stringify({
    ok: false,
    step: STEP,
    baseUrl: BASE_URL,
    error: error.message,
    timestamp: new Date().toISOString()
  }, null, 2));
  if (admin.apps.length) await admin.app().delete();
  process.exit(1);
});
