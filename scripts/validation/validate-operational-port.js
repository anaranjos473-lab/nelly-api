import fetch from 'node-fetch';

const BASE_URL = process.env.BASE_URL || process.env.RENDER_URL || 'http://127.0.0.1:3001';
const API_KEY = process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const PANEL_EMAIL = process.env.P1_PANEL_EMAIL || 'admin@nellydelivery.com';
const PANEL_PASSWORD = process.env.P1_PANEL_PASSWORD || 'NellyS4Test123!';
const MAX_DELIVERY_AVG_MINUTES = Number(process.env.MAX_DELIVERY_AVG_MINUTES || 240);

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

async function signInPanel() {
  const payload = await requestJson(`https://identitytoolkit.googleapis.com/v1/accounts:signInWithPassword?key=${API_KEY}`, {
    method: 'POST',
    body: JSON.stringify({
      email: PANEL_EMAIL,
      password: PANEL_PASSWORD,
      returnSecureToken: true
    })
  });
  if (!payload?.idToken) {
    throw new Error('No se obtuvo idToken de panel');
  }
  return payload.idToken;
}

function assert(condition, message, details = {}) {
  if (!condition) {
    const error = new Error(message);
    error.details = details;
    throw error;
  }
}

async function main() {
  const health = await requestJson(`${BASE_URL}/api/health`);
  assert(health?.success === true, 'Health no responde success=true', { health });

  const token = await signInPanel();
  const snapshot = await requestJson(`${BASE_URL}/api/admin/dashboard/operativo`, {
    headers: { Authorization: `Bearer ${token}` }
  });

  const commercialSummary = snapshot?.projections?.commercial?.summary || {};
  const commercialInsights = snapshot?.projections?.commercial_insights || {};
  const operationalQuality = snapshot?.projections?.operational_quality || null;
  const deliveryAvg = Number(commercialSummary.tiempo_promedio_entrega || 0);
  const promotions = Array.isArray(commercialInsights.promotions) ? commercialInsights.promotions : [];
  const opportunities = Array.isArray(commercialInsights.opportunities) ? commercialInsights.opportunities : [];
  const actions = Array.isArray(commercialInsights.actions) ? commercialInsights.actions : [];

  assert(snapshot?.ok === true, 'Dashboard operativo no esta en OK', { ok: snapshot?.ok });
  assert(snapshot?.health?.backend === true, 'Backend no esta saludable en snapshot', { health: snapshot?.health });
  assert(snapshot?.health?.rtdb === true, 'RTDB no esta saludable en snapshot', { health: snapshot?.health });
  assert(snapshot?.health?.ledger === true, 'Ledger no esta saludable en snapshot', { health: snapshot?.health });
  assert(snapshot?.health?.finanzas === true, 'Finanzas no esta saludable en snapshot', { health: snapshot?.health });
  assert(deliveryAvg >= 0 && deliveryAvg <= MAX_DELIVERY_AVG_MINUTES, 'Tiempo promedio de entrega fuera del rango operativo', {
    deliveryAvg,
    max: MAX_DELIVERY_AVG_MINUTES
  });
  assert(operationalQuality && typeof operationalQuality === 'object', 'Q1 no aparece como operational_quality en snapshot');
  assert(opportunities.length > 0, 'C4 no expone oportunidades');
  assert(actions.length > 0, 'C4 no expone acciones sugeridas');
  assert(promotions.length > 0, 'C5 no expone promociones sugeridas');

  console.log(JSON.stringify({
    ok: true,
    base_url: BASE_URL,
    health: {
      success: health.success,
      status: health.status,
      uptime: health.uptime,
      pid: health.pid || null,
      runtime_started_at: health.runtime_started_at || null
    },
    snapshot: {
      ok: snapshot.ok,
      pedidos_activos: snapshot.overview?.pedidos_activos ?? null,
      entregas_hoy: snapshot.overview?.entregas_hoy ?? null,
      tiempo_promedio_entrega: deliveryAvg,
      entregas_puntuales_pct: commercialSummary.entregas_puntuales_pct ?? null,
      c4_oportunidades: opportunities.length,
      c4_acciones: actions.length,
      c5_promociones: promotions.length,
      q1_signal: operationalQuality.signal || null,
      q1_summary: operationalQuality.summary || null
    }
  }, null, 2));
}

main().catch((error) => {
  console.error(JSON.stringify({
    ok: false,
    base_url: BASE_URL,
    message: error.message,
    details: error.details || null,
    status: error.status || null,
    body: error.body || null
  }, null, 2));
  process.exit(1);
});
