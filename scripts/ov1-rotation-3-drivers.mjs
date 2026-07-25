import fetch from 'node-fetch';

const BASE_URL = process.env.RENDER_URL || process.env.BASE_URL || 'http://127.0.0.1:3001';
const CYCLES = Number(process.env.P1_CYCLES || process.env.OV1_CYCLES || 20);
const DELAY_MS = Number(process.env.P1_DELAY_MS || process.env.OV1_DELAY_MS || 0);
const PANEL_EMAIL = process.env.P1_PANEL_EMAIL || 'admin@nellydelivery.com';
const PANEL_PASSWORD = process.env.P1_PANEL_PASSWORD || 'NellyS4Test123!';
const API_KEY = process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const TOKEN_EXPIRY_SKEW_MS = Number(process.env.OV1_TOKEN_EXPIRY_SKEW_MS || 60_000);

const DRIVERS = [
  { uid: process.env.P1_DRIVER_1_UID || 'ULILm4AyJGbfQzuUlC9ySpGrQrf1', email: process.env.P1_DRIVER_1_EMAIL || 'pilot_p1_002@nelly.com', password: process.env.P1_DRIVER_1_PASSWORD || 'PilotP1!2026' },
  { uid: process.env.P1_DRIVER_2_UID || 'iXXl1erAQxW0Hht0CLWzlOYGaAi1', email: process.env.P1_DRIVER_2_EMAIL || 'pilot_p1_003@nelly.com', password: process.env.P1_DRIVER_2_PASSWORD || 'PilotP1!2026' },
  { uid: process.env.P1_DRIVER_3_UID || '9XPSCLkFUWeZnxWoFgZEf0uzkTe2', email: process.env.P1_DRIVER_3_EMAIL || 'pilot_p1_004@nelly.com', password: process.env.P1_DRIVER_3_PASSWORD || 'PilotP1!2026' }
];

const tokenCache = new Map();
const authStats = {
  signInRequests: 0,
  tokenReuses: 0,
  tokenRefreshesAfter401: 0
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function requestJson(url, options = {}) {
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    }
  });
  const text = await response.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch (_error) {
    body = { raw: text };
  }
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status}`);
    error.status = response.status;
    error.body = body;
    throw error;
  }
  return body;
}

async function signInWithPassword(email, password) {
  authStats.signInRequests += 1;
  const body = await requestJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  if (!body?.idToken) {
    throw new Error(`No se pudo autenticar con ${email}`);
  }
  const expiresInMs = Number(body.expiresIn || 3600) * 1000;
  return {
    idToken: body.idToken,
    expiresAt: Date.now() + expiresInMs - TOKEN_EXPIRY_SKEW_MS
  };
}

async function getToken(session, { forceRefresh = false } = {}) {
  const cached = tokenCache.get(session.email);
  if (!forceRefresh && cached?.idToken && cached.expiresAt > Date.now()) {
    authStats.tokenReuses += 1;
    return cached.idToken;
  }

  const next = await signInWithPassword(session.email, session.password);
  tokenCache.set(session.email, next);
  return next.idToken;
}

async function requestWithSession(session, url, options = {}) {
  const token = await getToken(session);
  try {
    return await requestJson(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`
      }
    });
  } catch (error) {
    if (error.status !== 401) {
      throw error;
    }
    authStats.tokenRefreshesAfter401 += 1;
    const refreshedToken = await getToken(session, { forceRefresh: true });
    return requestJson(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${refreshedToken}`
      }
    });
  }
}

async function runCycle(index) {
  const panelSession = { email: PANEL_EMAIL, password: PANEL_PASSWORD };
  const driverConfig = DRIVERS[index % DRIVERS.length];
  const driverSession = { email: driverConfig.email, password: driverConfig.password };
  const pedidoId = `P1_ROT_${Date.now()}_${index}`;
  const payload = {
    pedidoId,
    pedido: {
      cliente_nombre: `Cliente ${pedidoId}`,
      descripcion: `Rotacion OV1 ciclo ${index + 1}`,
      monto_total: 180,
      monto: 180,
      total: 180,
      id_pedido: pedidoId,
      telefono: '+529999999999',
      direccion: `Calle rotacion ${index + 1}`
    }
  };

  const dispatch = await requestWithSession(panelSession, `${BASE_URL}/api/delivery/dispatch-order`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
  const accept = await requestWithSession(driverSession, `${BASE_URL}/api/delivery/accept-order`, {
    method: 'POST',
    body: JSON.stringify({ pedidoId })
  });
  const complete = await requestWithSession(driverSession, `${BASE_URL}/api/delivery/complete-order`, {
    method: 'POST',
    body: JSON.stringify({ pedidoId })
  });
  const snapshot = await requestWithSession(panelSession, `${BASE_URL}/api/admin/dashboard/operativo`);

  return {
    pedidoId,
    driverUid: driverConfig.uid,
    driverEmail: driverConfig.email,
    dispatchOk: dispatch?.ok === true,
    acceptOk: accept?.ok === true,
    completeOk: complete?.ok === true,
    dashboardOk: snapshot?.ok === true,
    dashboardStatus: snapshot?.ok ? 'GREEN' : 'UNHEALTHY',
    backendOk: Boolean(snapshot?.health?.backend),
    financeOk: Boolean(snapshot?.projections?.finance?.ledger?.reconciled),
    metricSignal: snapshot?.projections?.metrics?.signal || null,
    auditSignal: snapshot?.projections?.audit?.signal || null
  };
}

async function main() {
  const runs = [];
  const errors = [];

  for (let i = 0; i < CYCLES; i += 1) {
    try {
      const summary = await runCycle(i);
      runs.push(summary);
      console.log(JSON.stringify(summary, null, 2));
      if (DELAY_MS > 0) {
        await sleep(DELAY_MS);
      }
    } catch (error) {
      const failure = {
        cycle: i + 1,
        message: error.message,
        status: error.status || null,
        body: error.body || null
      };
      errors.push(failure);
      console.error(JSON.stringify(failure, null, 2));
      break;
    }
  }

  const report = {
    goal: 'GOAL-P1-001',
    section: 'ov1-driver-rotation',
    base_url: BASE_URL,
    auth_strategy: 'token-cache-per-session',
    auth_stats: authStats,
    cycles_requested: CYCLES,
    cycles_completed: runs.length,
    ok: errors.length === 0,
    errors,
    runs
  };

  console.log(JSON.stringify(report, null, 2));
  if (errors.length > 0) {
    process.exit(1);
  }
}

main().catch((error) => {
  console.error(JSON.stringify({ ok: false, message: error.message, stack: error.stack }, null, 2));
  process.exit(1);
});
