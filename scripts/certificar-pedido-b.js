import { createHash } from 'crypto';
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
const DEV_AUTH_TOKEN = process.env.DEV_AUTH_TOKEN || '';
const DEV_AUTH_UID = process.env.DEV_AUTH_UID || DRIVER_UID;

function readJson(pathName) {
  if (!existsSync(pathName)) return null;
  return JSON.parse(readFileSync(pathName, 'utf8'));
}

async function fetchJson(url, options = {}) {
  const res = await fetch(url, {
    ...options,
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) }
  });
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
  const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || '';
  if (!apiKey) {
    return customToken;
  }
  const signInUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`;
  const data = await fetchJson(signInUrl, {
    method: 'POST',
    body: JSON.stringify({ token: customToken, returnSecureToken: true })
  });
  if (!data?.idToken) throw new Error('No se pudo intercambiar el custom token');
  return data.idToken;
}

export { exchangeCustomToken };

async function getToken(kind) {
  if (DEV_AUTH_TOKEN) {
    return DEV_AUTH_TOKEN;
  }
  const tokenUrl = `${BASE_URL}/api/auth/${kind === 'panel' ? 'panel' : 'driver'}-token?uid=${encodeURIComponent(kind === 'panel' ? PANEL_UID : DRIVER_UID)}`;
  const data = await fetchJson(tokenUrl, { method: 'GET' });
  if (!data?.token) throw new Error(`No se pudo obtener token ${kind}`);
  return exchangeCustomToken(data.token);
}

async function main() {
  const pedidoId = `PEDIDO_B_${Date.now()}`;
  const panelToken = await getToken('panel');
  const driverToken = await getToken('driver');

  const pedido = {
    pedidoId,
    pedido: {
      cliente_nombre: `Pedido B ${pedidoId}`,
      descripcion: 'Certificación operativa ciclo B',
      monto_total: 180,
      monto: 180,
      total: 180,
      id_pedido: pedidoId,
      telefono: '+529999999999',
      direccion: 'Calle Certificación B'
    }
  };

  const dispatch = await fetchJson(`${BASE_URL}/api/delivery/dispatch-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${panelToken}` },
    body: JSON.stringify(pedido)
  });

  console.log('DISPATCH_OK', dispatch);

  const accept = await fetchJson(`${BASE_URL}/api/delivery/accept-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverToken}` },
    body: JSON.stringify({ pedidoId })
  });

  console.log('ACCEPT_OK', accept);

  const complete = await fetchJson(`${BASE_URL}/api/delivery/complete-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverToken}` },
    body: JSON.stringify({ pedidoId })
  });

  console.log('COMPLETE_OK', complete);
}

if (process.argv[1] && path.basename(process.argv[1]) === 'certificar-pedido-b.js') {
  main().catch((error) => {
    console.error('ERROR_CERTIFICACION', error.message);
    if (error.response) {
      console.error(error.response.status, error.response.data);
    }
    process.exit(1);
  });
}
