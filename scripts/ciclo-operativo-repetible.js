import { readFileSync, existsSync } from 'fs';
import path from 'path';
import fetch from 'node-fetch';

function loadEnvFile(fileName = '.env') {
  const envPath = path.join(process.cwd(), fileName);
  if (!existsSync(envPath)) return;
  const lines = readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

loadEnvFile();

const BASE_URL = process.env.RENDER_URL || process.env.RENDER_BASE_URL || 'http://localhost:3001';
const DRIVER_UID = process.env.DRIVER_UID || 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';
const PANEL_UID = process.env.PANEL_BOOTSTRAP_UID || 'panel-admin';
const AUTH_BOOTSTRAP_TOKEN = process.env.AUTH_BOOTSTRAP_TOKEN || '';
const FIREBASE_WEB_API_KEY = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || '';
const FIREBASE_EMAIL = process.env.FIREBASE_EMAIL || '';
const FIREBASE_PASSWORD = process.env.FIREBASE_PASSWORD || '';
const FIREBASE_ID_TOKEN = process.env.FIREBASE_ID_TOKEN || '';
const DEV_AUTH_TOKEN = process.env.DEV_AUTH_TOKEN || '';
const DEV_AUTH_UID = process.env.DEV_AUTH_UID || '';

function resolveAuthConfig(env = process.env) {
  if (env.FIREBASE_ID_TOKEN) {
    return { mode: 'id-token', token: env.FIREBASE_ID_TOKEN };
  }
  if (env.DEV_AUTH_TOKEN) {
    return { mode: 'dev-auth', token: env.DEV_AUTH_TOKEN, uid: env.DEV_AUTH_UID || DRIVER_UID };
  }
  if (env.FIREBASE_EMAIL && env.FIREBASE_PASSWORD && (env.FIREBASE_API_KEY || env.FIREBASE_WEB_API_KEY)) {
    return {
      mode: 'firebase-auth',
      email: env.FIREBASE_EMAIL,
      password: env.FIREBASE_PASSWORD,
      apiKey: env.FIREBASE_API_KEY || env.FIREBASE_WEB_API_KEY
    };
  }
  return { mode: 'bootstrap-token' };
}

function buildCertificationReport({ pedidoId, steps, startedAt, completedAt }) {
  const failedSteps = steps.filter((step) => !step.ok);
  const status = failedSteps.length === 0 ? 'PASS' : 'FAIL';
  return {
    pedidoId,
    status,
    startedAt,
    completedAt,
    durationMs: completedAt - startedAt,
    steps,
    summary: {
      ok: failedSteps.length === 0,
      totalSteps: steps.length,
      failedSteps: failedSteps.map((step) => step.name)
    }
  };
}

function loadToken() {
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (!existsSync(localPath)) return null;
  const raw = readFileSync(localPath, 'utf8');
  return JSON.parse(raw);
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, { ...options, headers: { 'Content-Type': 'application/json', ...(options.headers || {}) } });
  const text = await res.text();
  let payload = null;
  try { payload = text ? JSON.parse(text) : null; } catch (_e) { payload = text; }
  if (!res.ok) {
    const error = new Error(`HTTP ${res.status}`);
    error.response = { status: res.status, data: payload };
    throw error;
  }
  return payload;
}

async function exchangeCustomToken(customToken) {
  if (!FIREBASE_WEB_API_KEY) {
    return customToken;
  }
  const url = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${FIREBASE_WEB_API_KEY}`;
  const data = await fetchJson(url, {
    method: 'POST',
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  });
  if (!data?.idToken) throw new Error('No se pudo intercambiar custom token');
  return data.idToken;
}

async function getPanelToken() {
  const authConfig = resolveAuthConfig();
  if (authConfig.mode === 'id-token') {
    return authConfig.token;
  }
  if (authConfig.mode === 'dev-auth') {
    return authConfig.token;
  }
  if (authConfig.mode === 'firebase-auth') {
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${authConfig.apiKey}`;
    const data = await fetchJson(signInUrl, {
      method: 'POST',
      body: JSON.stringify({ email: authConfig.email, password: authConfig.password, returnSecureToken: true })
    });
    if (!data?.idToken) throw new Error('No se pudo autenticar con Firebase Auth');
    return data.idToken;
  }
  const tokenUrl = `${BASE_URL}/api/auth/panel-token?uid=${encodeURIComponent(PANEL_UID)}${AUTH_BOOTSTRAP_TOKEN ? `&token=${encodeURIComponent(AUTH_BOOTSTRAP_TOKEN)}` : ''}`;
  const data = await fetchJson(tokenUrl, { method: 'GET' });
  if (!data?.token) throw new Error('No se pudo obtener token de panel');
  return exchangeCustomToken(data.token);
}

async function getDriverToken() {
  const authConfig = resolveAuthConfig();
  if (authConfig.mode === 'id-token') {
    return authConfig.token;
  }
  if (authConfig.mode === 'dev-auth') {
    return authConfig.token;
  }
  if (authConfig.mode === 'firebase-auth') {
    const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${authConfig.apiKey}`;
    const data = await fetchJson(signInUrl, {
      method: 'POST',
      body: JSON.stringify({ email: authConfig.email, password: authConfig.password, returnSecureToken: true })
    });
    if (!data?.idToken) throw new Error('No se pudo autenticar con Firebase Auth');
    return data.idToken;
  }
  const tokenUrl = `${BASE_URL}/api/auth/driver-token?uid=${encodeURIComponent(DRIVER_UID)}${AUTH_BOOTSTRAP_TOKEN ? `&token=${encodeURIComponent(AUTH_BOOTSTRAP_TOKEN)}` : ''}`;
  const data = await fetchJson(tokenUrl, { method: 'GET' });
  if (!data?.token) throw new Error('No se pudo obtener token de repartidor');
  return exchangeCustomToken(data.token);
}

async function main() {
  const startedAt = Date.now();
  const pedidoId = `CICLO_REPETIBLE_${Date.now()}`;
  const steps = [];

  try {
    const panelToken = await getPanelToken();
    const driverToken = await getDriverToken();

    const payload = {
      pedidoId,
      pedido: {
        cliente_nombre: `Cliente ${pedidoId}`,
        descripcion: 'Ciclo repetible B/C/D',
        monto_total: 180,
        monto: 180,
        total: 180,
        id_pedido: pedidoId,
        telefono: '+529999999999',
        direccion: 'Calle prueba repetible'
      }
    };

    const dispatch = await fetchJson(`${BASE_URL}/api/delivery/dispatch-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${panelToken}` },
      body: JSON.stringify(payload)
    });
    steps.push({ name: 'dispatch', ok: true, status: 'OK', response: dispatch });
    console.log('DISPATCH_OK', dispatch);

    const accept = await fetchJson(`${BASE_URL}/api/delivery/accept-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({ pedidoId })
    });
    steps.push({ name: 'accept', ok: true, status: 'OK', response: accept });
    console.log('ACCEPT_OK', accept);

    const complete = await fetchJson(`${BASE_URL}/api/delivery/complete-order`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${driverToken}` },
      body: JSON.stringify({ pedidoId })
    });
    steps.push({ name: 'complete', ok: true, status: 'OK', response: complete });
    console.log('COMPLETE_OK', complete);

    const report = buildCertificationReport({ pedidoId, steps, startedAt, completedAt: Date.now() });
    console.log(JSON.stringify(report, null, 2));
    return report;
  } catch (error) {
    steps.push({ name: 'certification', ok: false, status: 'ERROR', error: error.message });
    const report = buildCertificationReport({ pedidoId, steps, startedAt, completedAt: Date.now() });
    console.error(JSON.stringify(report, null, 2));
    process.exit(1);
  }
}

if (process.argv[1] && path.basename(process.argv[1]) === 'ciclo-operativo-repetible.js') {
  main();
}

export { resolveAuthConfig, buildCertificationReport };
