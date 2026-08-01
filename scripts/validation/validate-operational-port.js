import fetch from 'node-fetch';
import jwt from 'jsonwebtoken';
import fs from 'fs';
import path from 'path';

function loadEnvFile(fileName) {
  const envPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(envPath)) return;
  const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) {
      process.env[key] = rest.join('=').trim().replace(/^["']|["']$/g, '');
    }
  }
}

loadEnvFile('.env.local');
loadEnvFile('.env');

const BASE_URL = process.env.BASE_URL || process.env.RENDER_URL || 'http://127.0.0.1:3001';
const API_KEY = process.env.FIREBASE_WEB_API_KEY || process.env.FIREBASE_API_KEY || 'AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E';
const PANEL_EMAIL = process.env.P1_PANEL_EMAIL || 'admin@nellydelivery.com';
const PANEL_PASSWORD = process.env.P1_PANEL_PASSWORD || 'NellyS4Test123!';
const MAX_DELIVERY_AVG_MINUTES = Number(process.env.MAX_DELIVERY_AVG_MINUTES || 240);

const DIAGNOSTICS = {
  PORT_HEALTH_UNREACHABLE: {
    layer: 'infraestructura',
    probable_cause: 'El backend no responde en el puerto operativo configurado o el proceso no esta levantado.',
    action: 'Verificar que el backend este corriendo en 3001, revisar procesos duplicados y ejecutar /api/health.'
  },
  HEALTH_NOT_OK: {
    layer: 'infraestructura',
    probable_cause: 'El endpoint de salud respondio, pero no confirma success=true.',
    action: 'Revisar arranque del backend, configuracion de entorno y logs iniciales.'
  },
  SNAPSHOT_AUTH_FAILED: {
    layer: 'autenticacion',
    probable_cause: 'No se pudo obtener token administrativo para consultar el snapshot protegido.',
    action: 'Revisar credenciales del panel, Firebase Auth, conectividad externa y variables FIREBASE_API_KEY.'
  },
  SNAPSHOT_REQUEST_FAILED: {
    layer: 'operacion',
    probable_cause: 'El snapshot operativo protegido no pudo consultarse con el token administrativo.',
    action: 'Revisar /api/admin/dashboard/operativo, middleware de autenticacion y logs del backend.'
  },
  SNAPSHOT_NOT_OK: {
    layer: 'operacion',
    probable_cause: 'El dashboard respondio, pero el snapshot no esta en estado OK.',
    action: 'Revisar health interno, proyecciones y consistencia de la SSOT.'
  },
  BACKEND_SNAPSHOT_UNHEALTHY: {
    layer: 'operacion',
    probable_cause: 'La proyeccion de salud no considera saludable al backend.',
    action: 'Revisar health dentro del snapshot y comparar con /api/health.'
  },
  RTDB_SNAPSHOT_UNHEALTHY: {
    layer: 'datos',
    probable_cause: 'RTDB no aparece saludable en el snapshot operativo.',
    action: 'Revisar conexion Firebase Admin, reglas, credenciales y lectura de pedidos.'
  },
  LEDGER_SNAPSHOT_UNHEALTHY: {
    layer: 'finanzas',
    probable_cause: 'Ledger no aparece conciliado o disponible en el snapshot.',
    action: 'Ejecutar validate-ledger y revisar movimientos financieros recientes.'
  },
  FINANCE_SNAPSHOT_UNHEALTHY: {
    layer: 'finanzas',
    probable_cause: 'Finanzas no aparecen saludables en el snapshot.',
    action: 'Revisar deuda, saldo_ganancias, ledger y validate-billing-adapter.'
  },
  DELIVERY_AVG_OUT_OF_RANGE: {
    layer: 'metricas',
    probable_cause: 'El tiempo promedio de entrega esta fuera del rango operativo esperado.',
    action: 'Revisar timestamps, pedidos historicos contaminantes y formula de promedio.'
  },
  Q1_PROJECTION_MISSING: {
    layer: 'calidad',
    probable_cause: 'Q1 no aparece como operational_quality en el snapshot.',
    action: 'Revisar captura de incidencias, proyeccion Q1 y dashboardProjections.'
  },
  C4_OPPORTUNITIES_EMPTY: {
    layer: 'inteligencia_comercial',
    probable_cause: 'C4 no expone oportunidades comerciales.',
    action: 'Revisar datos de CRM, Q1 y reglas de commercial_insights.'
  },
  C4_ACTIONS_EMPTY: {
    layer: 'inteligencia_comercial',
    probable_cause: 'C4 no expone acciones sugeridas.',
    action: 'Revisar derivacion de acciones desde oportunidades y consistencia de entrada.'
  },
  C5_PROMOTIONS_EMPTY: {
    layer: 'promociones',
    probable_cause: 'C5 no expone promociones sugeridas derivadas de C4.',
    action: 'Revisar reglas de C5, salida de commercial_insights y relacion C4 -> C5.'
  }
};

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
  if (process.env.JWT_SECRET) {
    return jwt.sign(
      {
        uid: PANEL_EMAIL,
        email: PANEL_EMAIL,
        admin: true,
        panel: true,
        role: 'panel_cocina'
      },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );
  }

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

function createDiagnosticError(code, message, details = {}) {
  const diagnostic = DIAGNOSTICS[code] || {
    layer: 'desconocida',
    probable_cause: 'No existe diagnostico registrado para este fallo.',
    action: 'Revisar logs y agregar un codigo de diagnostico accionable.'
  };
  const error = new Error(message);
  error.code = code;
  error.layer = diagnostic.layer;
  error.probable_cause = diagnostic.probable_cause;
  error.action = diagnostic.action;
  error.details = details;
  return error;
}

function assertDiagnostic(condition, code, message, details = {}) {
  if (!condition) {
    throw createDiagnosticError(code, message, details);
  }
}

async function main() {
  let health = null;
  try {
    health = await requestJson(`${BASE_URL}/api/health`);
  } catch (error) {
    throw createDiagnosticError('PORT_HEALTH_UNREACHABLE', 'No se pudo consultar /api/health en el puerto operativo', {
      status: error.status || null,
      body: error.body || null,
      message: error.message
    });
  }
  assertDiagnostic(health?.success === true, 'HEALTH_NOT_OK', 'Health no responde success=true', { health });

  let token = null;
  try {
    token = await signInPanel();
  } catch (error) {
    throw createDiagnosticError('SNAPSHOT_AUTH_FAILED', 'No se pudo autenticar el panel para validar el snapshot', {
      status: error.status || null,
      body: error.body || null,
      message: error.message
    });
  }

  let snapshot = null;
  try {
    snapshot = await requestJson(`${BASE_URL}/api/admin/dashboard/operativo`, {
      headers: { Authorization: `Bearer ${token}` }
    });
  } catch (error) {
    throw createDiagnosticError('SNAPSHOT_REQUEST_FAILED', 'No se pudo consultar el dashboard operativo protegido', {
      status: error.status || null,
      body: error.body || null,
      message: error.message
    });
  }

  const commercialSummary = snapshot?.projections?.commercial?.summary || {};
  const commercialInsights = snapshot?.projections?.commercial_insights || {};
  const operationalQuality = snapshot?.projections?.operational_quality || null;
  const deliveryAvg = Number(commercialSummary.tiempo_promedio_entrega || 0);
  const promotions = Array.isArray(commercialInsights.promotions) ? commercialInsights.promotions : [];
  const opportunities = Array.isArray(commercialInsights.opportunities) ? commercialInsights.opportunities : [];
  const actions = Array.isArray(commercialInsights.actions) ? commercialInsights.actions : [];

  assertDiagnostic(snapshot?.ok === true, 'SNAPSHOT_NOT_OK', 'Dashboard operativo no esta en OK', { ok: snapshot?.ok });
  assertDiagnostic(snapshot?.health?.backend === true, 'BACKEND_SNAPSHOT_UNHEALTHY', 'Backend no esta saludable en snapshot', { health: snapshot?.health });
  assertDiagnostic(snapshot?.health?.rtdb === true, 'RTDB_SNAPSHOT_UNHEALTHY', 'RTDB no esta saludable en snapshot', { health: snapshot?.health });
  assertDiagnostic(snapshot?.health?.ledger === true, 'LEDGER_SNAPSHOT_UNHEALTHY', 'Ledger no esta saludable en snapshot', { health: snapshot?.health });
  assertDiagnostic(snapshot?.health?.finanzas === true, 'FINANCE_SNAPSHOT_UNHEALTHY', 'Finanzas no esta saludable en snapshot', { health: snapshot?.health });
  assertDiagnostic(deliveryAvg >= 0 && deliveryAvg <= MAX_DELIVERY_AVG_MINUTES, 'DELIVERY_AVG_OUT_OF_RANGE', 'Tiempo promedio de entrega fuera del rango operativo', {
    deliveryAvg,
    max: MAX_DELIVERY_AVG_MINUTES
  });
  assertDiagnostic(operationalQuality && typeof operationalQuality === 'object', 'Q1_PROJECTION_MISSING', 'Q1 no aparece como operational_quality en snapshot');
  assertDiagnostic(opportunities.length > 0, 'C4_OPPORTUNITIES_EMPTY', 'C4 no expone oportunidades');
  assertDiagnostic(actions.length > 0, 'C4_ACTIONS_EMPTY', 'C4 no expone acciones sugeridas');
  assertDiagnostic(promotions.length > 0, 'C5_PROMOTIONS_EMPTY', 'C5 no expone promociones sugeridas');

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
    code: error.code || 'VALIDATION_ERROR',
    layer: error.layer || 'desconocida',
    message: error.message,
    probable_cause: error.probable_cause || null,
    action: error.action || null,
    details: error.details || null,
    status: error.status || null,
    body: error.body || null
  }, null, 2));
  process.exit(1);
});
