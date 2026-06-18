import fs from 'fs';
import path from 'path';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { getFirebaseConfig } from '../config/firebase-config.js';
import { loadEnv } from '../src/utils/envLoader.js';

loadEnv('.env.local');
loadEnv('.env');

const localBase = String(process.env.LOCAL_BASE || 'http://localhost:3001').replace(/\/+$/, '');
const driverUid = process.env.RC26_DRIVER_UID || 'driver_cert_rc26';
const pedidoId = process.env.RC26_PEDIDO_ID || `RC26_${Date.now()}`;
const cleanup = process.env.RC26_CLEANUP === 'true';
const monto = Number(process.env.RC26_MONTO || 129);
const apiKey = process.env.FIREBASE_API_KEY || process.env.FIREBASE_WEB_API_KEY || getFirebaseConfig().apiKey;
const evidenceDir = process.env.RC26_EVIDENCE_DIR || 'logs_pruebas';
const ubicacionPrueba = {
  lat: Number(process.env.RC26_LAT || 16.7528),
  lng: Number(process.env.RC26_LNG || -93.1167)
};

if (!apiKey) {
  throw new Error('FIREBASE_API_KEY o FIREBASE_WEB_API_KEY es requerida para autenticar al driver.');
}

const steps = [];

function nowIso() {
  return new Date().toISOString();
}

function record(name, ok, detail = {}) {
  const entry = { step: name, ok, timestamp: nowIso(), ...detail };
  steps.push(entry);
  const icon = ok ? 'OK' : 'FAIL';
  console.log(`[${icon}] ${name}${detail.status ? ` (${detail.status})` : ''}`);
  if (detail.error) console.log(`      ${detail.error}`);
  return entry;
}

async function query(db, refPath) {
  const snap = await db.ref(refPath).once('value');
  return snap.val();
}

async function postJson(url, token, body) {
  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`
    },
    body: JSON.stringify(body)
  });
  const text = await response.text();
  let json = null;
  try {
    json = text ? JSON.parse(text) : null;
  } catch {
    json = null;
  }
  return { response, text, json };
}

async function getDriverToken(admin) {
  const customToken = await admin.auth().createCustomToken(driverUid, { driver: true });
  const response = await fetch(
    `https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token: customToken, returnSecureToken: true })
    }
  );
  const json = await response.json();
  if (!json.idToken) {
    throw new Error(`No se pudo obtener idToken del driver: ${JSON.stringify(json)}`);
  }
  return json.idToken;
}

async function assertHealth() {
  const response = await fetch(`${localBase}/api/health`);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`Backend offline o no saludable. GET /api/health => ${response.status} ${text}`);
  }
  record('Backend healthcheck', true, { status: response.status });
}

async function seedDriver(db) {
  const data = {
    estatus: { nivel: 'BRONCE', bloqueado_por_deuda: false },
    perfil: { bloqueado_por_deuda: false },
    billetera: {
      billetera_guerra: 1000,
      capital_disponible: 1000,
      capital_reservado: 0,
      reservas_capital: {}
    },
    finanzas: {
      deuda_actual: 0,
      limite_deuda: 300,
      saldo_ganancias: 0,
      capital_disponible: 1000,
      capital_reservado: 0,
      reservas_capital: {}
    },
    equipamiento: {
      caja_grande: true,
      tensor: true,
      mochila_termica: true
    },
    ubicacion: {
      ...ubicacionPrueba,
      timestamp: Date.now()
    }
  };
  await db.ref(`repartidores/${driverUid}`).set(data);
  record('Driver certificado preparado', true, { uid: driverUid });
}

async function seedPedidoPendiente(db) {
  const timestamp = Date.now();
  const pedido = {
    id: pedidoId,
    id_pedido: pedidoId,
    cliente_nombre: 'Cliente Certificacion RC2.6',
    telefono: '9610000000',
    direccion: 'Validacion operativa Nelly',
    descripcion: 'Pedido de certificacion Pedido-Asignacion-Entrega-Cobro',
    monto,
    monto_total: monto,
    estado: 'pendiente',
    estado_pedido: 'pendiente',
    repartidor_id: null,
    fecha_creacion: timestamp,
    origen: 'certificacion_rc26'
  };
  await db.ref(`pedidos/${pedidoId}`).set(pedido);
  record('Pedido inyectado', true, { pedidoId });
}

async function marcarListo(db) {
  const pedido = await query(db, `pedidos/${pedidoId}`);
  if (!pedido) {
    throw new Error(`Pedido ${pedidoId} no existe en /pedidos`);
  }

  const timestamp = Date.now();
  const listo = {
    ...pedido,
    estado: 'LISTO',
    estado_pedido: 'LISTO',
    fecha_listo: timestamp,
    timestamp_listo: timestamp,
    version: pedido.version || 0
  };
  await db.ref().update({
    [`pedidos/${pedidoId}`]: listo,
    [`pedidos_para_reparto/${pedidoId}`]: listo
  });
  record('Pedido recibido y marcado LISTO', true, { pedidoId });
}

async function verificarEstado(db, refPath, expectedEstado) {
  const value = await query(db, refPath);
  const estado = value?.estado || value?.estado_pedido || value?.logistica?.estado;
  const ok = String(estado || '').toUpperCase() === expectedEstado;
  if (!ok) {
    throw new Error(`${refPath} esperaba ${expectedEstado}, obtuvo ${estado || 'null'}`);
  }
  return value;
}

async function writeEvidence(db) {
  fs.mkdirSync(evidenceDir, { recursive: true });
  const evidencePath = path.join(evidenceDir, `RC2_6_${pedidoId}.md`);
  const refs = {
    pedidos: await query(db, `pedidos/${pedidoId}`),
    pedidos_para_reparto: await query(db, `pedidos_para_reparto/${pedidoId}`),
    pedidos_en_camino: await query(db, `pedidos_en_camino/${pedidoId}`),
    repartidor: await query(db, `repartidores/${driverUid}`),
    conductor_activo: await query(db, `conductores_activos/${driverUid}`),
    eventos: await query(db, `order_events/${pedidoId}`)
  };

  const lines = [
    `# Certificacion RC2.6 - ${pedidoId}`,
    '',
    `Fecha: ${nowIso()}`,
    `Backend: ${localBase}`,
    `Driver UID: ${driverUid}`,
    `Cleanup solicitado: ${cleanup}`,
    '',
    '## Resultado',
    '',
    ...steps.map((s) => `- ${s.ok ? '[OK]' : '[FAIL]'} ${s.step} - ${s.timestamp}`),
    '',
    '## Evidencia RTDB',
    '',
    '```json',
    JSON.stringify(refs, null, 2),
    '```',
    ''
  ];
  fs.writeFileSync(evidencePath, lines.join('\n'), 'utf8');
  record('Evidencia escrita', true, { path: evidencePath });
  return evidencePath;
}

async function cleanupData(db) {
  await db.ref().update({
    [`pedidos/${pedidoId}`]: null,
    [`pedidos_para_reparto/${pedidoId}`]: null,
    [`pedidos_en_camino/${pedidoId}`]: null,
    [`order_events/${pedidoId}`]: null,
    [`conductores_activos/${driverUid}`]: null,
    [`repartidores/${driverUid}`]: null
  });
  record('Datos de certificacion limpiados', true);
}

async function main() {
  const admin = await getAdmin();
  const db = admin.database();

  try {
    await assertHealth();
    await seedDriver(db);
    await seedPedidoPendiente(db);
    await marcarListo(db);
    await verificarEstado(db, `pedidos_para_reparto/${pedidoId}`, 'LISTO');

    const idToken = await getDriverToken(admin);
    record('Token driver obtenido', true, { uid: driverUid });

    const accept = await postJson(`${localBase}/api/delivery/accept-order`, idToken, { pedidoId });
    if (!accept.response.ok || accept.json?.ok !== true) {
      throw new Error(`accept-order fallo: ${accept.response.status} ${accept.text}`);
    }
    await verificarEstado(db, `pedidos_para_reparto/${pedidoId}`, 'EN_CAMINO');
    await verificarEstado(db, `pedidos_en_camino/${pedidoId}`, 'EN_CAMINO');
    record('Driver acepta mision', true, { status: accept.response.status });

    const location = await postJson(`${localBase}/api/delivery/update-location`, idToken, {
      ...ubicacionPrueba,
      pedidoId
    });
    if (!location.response.ok || location.json?.ok !== true) {
      throw new Error(`update-location fallo: ${location.response.status} ${location.text}`);
    }
    record('GPS sincronizado', true, { status: location.response.status });

    const complete = await postJson(`${localBase}/api/delivery/complete-order`, idToken, { pedidoId });
    if (!complete.response.ok || complete.json?.ok !== true) {
      throw new Error(`complete-order fallo: ${complete.response.status} ${complete.text}`);
    }
    await verificarEstado(db, `pedidos/${pedidoId}`, 'ENTREGADO');
    record('Pedido entregado', true, { status: complete.response.status });

    const cash = await postJson(`${localBase}/api/delivery/finanzas/registrar-cobro-efectivo`, idToken, {
      pedidoId,
      monto_efectivo: monto
    });
    if (!cash.response.ok || cash.json?.ok !== true) {
      throw new Error(`registrar-cobro-efectivo fallo: ${cash.response.status} ${cash.text}`);
    }
    record('Cobro efectivo registrado', true, {
      status: cash.response.status,
      deudaActual: cash.json.deudaActual,
      saldoGanancias: cash.json.saldoGanancias
    });

    const evidencePath = await writeEvidence(db);
    if (cleanup) {
      await cleanupData(db);
    }
    console.log(`\nRC2.6 PASS: ${pedidoId}`);
    console.log(`Evidencia: ${evidencePath}`);
  } catch (error) {
    record('Certificacion RC2.6', false, { error: error.message });
    await writeEvidence(db).catch((e) => console.error(`No se pudo escribir evidencia: ${e.message}`));
    process.exitCode = 1;
  } finally {
    await admin.app().delete().catch(() => {});
  }
}

main();
