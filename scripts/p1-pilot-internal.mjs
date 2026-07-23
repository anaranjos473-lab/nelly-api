import fetch from 'node-fetch';

const BASE_URL = process.env.RENDER_URL || 'http://127.0.0.1:3015';
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const PANEL_EMAIL = process.env.P1_PANEL_EMAIL || 'admin@nellydelivery.com';
const PANEL_PASSWORD = process.env.P1_PANEL_PASSWORD || 'NellyS4Test123!';
const DRIVER_EMAIL = process.env.P1_DRIVER_EMAIL || 'driver-tuxtla-001@nelly.com';
const DRIVER_PASSWORD = process.env.P1_DRIVER_PASSWORD || 'Nelly2026#';
const CYCLES = Number(process.env.P1_CYCLES || 3);
const DELAY_MS = Number(process.env.P1_DELAY_MS || 0);

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
  const body = await requestJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({ email, password, returnSecureToken: true })
  });
  if (!body?.idToken) {
    throw new Error(`No se obtuvo idToken para ${email}`);
  }
  return body.idToken;
}

async function runCycle(index) {
  const panelToken = await signInWithPassword(PANEL_EMAIL, PANEL_PASSWORD);
  const driverToken = await signInWithPassword(DRIVER_EMAIL, DRIVER_PASSWORD);
  const pedidoId = `P1_${Date.now()}_${index}`;
  const payload = {
    pedidoId,
    pedido: {
      cliente_nombre: `Cliente ${pedidoId}`,
      descripcion: `Piloto controlado P1 ciclo ${index + 1}`,
      monto_total: 180,
      monto: 180,
      total: 180,
      id_pedido: pedidoId,
      telefono: '+529999999999',
      direccion: `Calle piloto controlado ${index + 1}`
    }
  };

  const dispatch = await requestJson(`${BASE_URL}/api/delivery/dispatch-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${panelToken}` },
    body: JSON.stringify(payload)
  });
  const accept = await requestJson(`${BASE_URL}/api/delivery/accept-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverToken}` },
    body: JSON.stringify({ pedidoId })
  });
  const complete = await requestJson(`${BASE_URL}/api/delivery/complete-order`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${driverToken}` },
    body: JSON.stringify({ pedidoId })
  });
  const snapshot = await requestJson(`${BASE_URL}/api/admin/dashboard/operativo`, {
    headers: { Authorization: `Bearer ${panelToken}` }
  });

  const summary = {
    pedidoId,
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

  return { dispatch, accept, complete, snapshot, summary };
}

async function main() {
  const startedAt = Date.now();
  const runs = [];
  const errors = [];

  for (let i = 0; i < CYCLES; i += 1) {
    try {
      const run = await runCycle(i);
      runs.push(run.summary);
      console.log(JSON.stringify(run.summary, null, 2));
      if (DELAY_MS > 0) {
        await sleep(DELAY_MS);
      }
    } catch (error) {
      errors.push({
        cycle: i + 1,
        message: error.message,
        status: error.status || null,
        body: error.body || null
      });
      console.error(JSON.stringify(errors[errors.length - 1], null, 2));
      break;
    }
  }

  const report = {
    goal: 'GOAL-P1-001',
    started_at: startedAt,
    completed_at: Date.now(),
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
  console.error(JSON.stringify({
    ok: false,
    message: error.message,
    stack: error.stack
  }, null, 2));
  process.exit(1);
});
