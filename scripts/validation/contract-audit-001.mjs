import fs from 'fs';
import path from 'path';
import admin from 'firebase-admin';

function loadEnvFile(fileName) {
  const fullPath = path.join(process.cwd(), fileName);
  if (!fs.existsSync(fullPath)) return;
  for (const rawLine of fs.readFileSync(fullPath, 'utf8').split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith('#') || !line.includes('=')) continue;
    const [key, ...rest] = line.split('=');
    if (!process.env[key]) process.env[key] = rest.join('=').trim();
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
  throw new Error('No se encontro credencial Firebase Admin');
}

function normalizeState(value) {
  return String(value || '').trim().toUpperCase();
}

function getPedidoId(order = {}) {
  return order.id || order.pedido_id || order.id_pedido || order.shortId || null;
}

function parseTimestamp(value) {
  if (value == null || value === '') return null;
  const numeric = Number(value);
  if (Number.isFinite(numeric) && numeric > 0) return numeric;
  const parsed = Date.parse(String(value));
  return Number.isFinite(parsed) ? parsed : null;
}

function getOrderTimestamp(order = {}) {
  return parseTimestamp(order.createdAt)
    || parseTimestamp(order.created_at)
    || parseTimestamp(order.fecha_creacion)
    || parseTimestamp(order.timestamp)
    || parseTimestamp(order.fecha)
    || null;
}

function detectBucket(order = {}, activeOrders = [], todayOrders = [], historicalOrders = []) {
  const pedidoId = getPedidoId(order);
  const inActive = activeOrders.some((item) => getPedidoId(item) === pedidoId);
  const inToday = todayOrders.some((item) => getPedidoId(item) === pedidoId);
  const inHistorical = historicalOrders.some((item) => getPedidoId(item) === pedidoId);
  return { inActive, inToday, inHistorical };
}

function buildDiagnosis(row) {
  if (row.estado_rtdb === 'ENTREGADO' && row.en_active_orders) {
    return 'INCONSISTENTE: ENTREGADO sigue activo';
  }
  if (row.estado_rtdb === 'LISTO' && !row.en_active_orders && !row.en_today_orders) {
    return 'INCONSISTENTE: LISTO no visible';
  }
  if (row.estado_rtdb === 'PENDIENTE' && row.en_historical_orders) {
    return 'INCONSISTENTE: PENDIENTE archivado';
  }
  return 'CORRECTO';
}

function markdownTable(rows) {
  const headers = ['PedidoId', 'shortId', 'Fecha creacion', 'Estado RTDB', 'Repartidor asignado', 'active_orders', 'today_orders', 'historical_orders', 'Panel', 'Driver', 'Diagnostico'];
  const lines = [
    `| ${headers.join(' | ')} |`,
    `| ${headers.map(() => '---').join(' | ')} |`
  ];
  rows.forEach((row) => {
    lines.push(`| ${row.pedido_id} | ${row.shortId || 'N/D'} | ${row.fecha_creacion || 'N/D'} | ${row.estado_rtdb || 'N/D'} | ${row.repartidor_id || 'N/D'} | ${row.en_active_orders ? 'Sí' : 'No'} | ${row.en_today_orders ? 'Sí' : 'No'} | ${row.en_historical_orders ? 'Sí' : 'No'} | ${row.visible_panel ? 'Sí' : 'No'} | ${row.visible_driver ? 'Sí' : 'No'} | ${row.diagnostico} |`);
  });
  return lines.join('\n');
}

async function main() {
  loadEnvFile('.env.local');
  loadEnvFile('.env');

  const sampleLimit = Number(process.env.CONTRACT_AUDIT_SAMPLE_LIMIT || 20);
  const explicitIds = String(process.env.CONTRACT_AUDIT_IDS || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
  const focusId = process.env.CONTRACT_AUDIT_FOCUS_ID || 'PED_1785200134315';
  const outDir = path.join(process.cwd(), 'docs', 'architecture', 'PILOTO_CONTROLADO');
  const resultsPath = path.join(outDir, 'CONTRACT_AUDIT_001_RESULTS.md');
  const evidencePath = path.join(outDir, 'CONTRACT_AUDIT_001_EVIDENCE.md');
  const jsonPath = path.join(outDir, 'contract-audit-report.json');

  const serviceAccount = loadServiceAccount();
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
    });
  }

  const db = admin.database();
  const pedidosSnap = await db.ref('pedidos').once('value');
  const pedidos = pedidosSnap.val() || {};
  const allOrders = Object.entries(pedidos).map(([id, value]) => ({ id, ...(value || {}) }));

  const focusOrder = allOrders.find((order) => getPedidoId(order) === focusId);
  const sorted = [...allOrders].sort((a, b) => (getOrderTimestamp(b) || 0) - (getOrderTimestamp(a) || 0));
  const chosen = [];
  if (focusOrder) chosen.push(focusOrder);
  for (const order of sorted) {
    if (chosen.length >= sampleLimit) break;
    if (getPedidoId(order) === focusId) continue;
    chosen.push(order);
  }
  for (const id of explicitIds) {
    const match = allOrders.find((order) => getPedidoId(order) === id);
    if (match && !chosen.some((order) => getPedidoId(order) === id)) {
      chosen.push(match);
    }
  }

  const contractResponse = await fetch(`${process.env.LOCAL_BASE || process.env.BASE_URL || 'http://127.0.0.1:3001'}/api/data-architecture/data-access`, {
    headers: {
      Authorization: `Bearer ${process.env.CONTRACT_AUDIT_TOKEN || ''}`
    }
  }).catch(() => null);
  const contractPayload = contractResponse ? await contractResponse.json().catch(() => ({})) : {};
  const activeOrders = Array.isArray(contractPayload.active_orders) ? contractPayload.active_orders : [];
  const todayOrders = Array.isArray(contractPayload.today_orders) ? contractPayload.today_orders : [];
  const historicalOrders = Array.isArray(contractPayload.historical_orders) ? contractPayload.historical_orders : [];

  const rows = chosen.map((order) => {
    const pedido_id = getPedidoId(order);
    const { inActive, inToday, inHistorical } = detectBucket(order, activeOrders, todayOrders, historicalOrders);
    const estado_rtdb = normalizeState(order.estado_pedido || order.estado || order.logistica?.estado);
    const fecha_creacion = getOrderTimestamp(order) ? new Date(getOrderTimestamp(order)).toISOString() : null;
    const repartidor_id = order.repartidor_id || order.repartidorId || order.conductorId || order.driverUid || null;
    const visible_panel = inActive || inToday || estado_rtdb === 'LISTO' || estado_rtdb === 'EN_CURSO';
    const visible_driver = inActive || inToday || estado_rtdb === 'LISTO' || estado_rtdb === 'EN_CURSO' || estado_rtdb === 'ENTREGADO';
    const row = {
      pedido_id,
      shortId: order.shortId || null,
      fecha_creacion,
      estado_rtdb,
      repartidor_id,
      en_active_orders: inActive,
      en_today_orders: inToday,
      en_historical_orders: inHistorical,
      visible_panel,
      visible_driver
    };
    row.diagnostico = buildDiagnosis(row);
    return row;
  });

  const stats = rows.reduce((acc, row) => {
    if (row.diagnostico === 'CORRECTO') acc.correctos += 1;
    else acc.inconsistencias += 1;
    return acc;
  }, { correctos: 0, inconsistencias: 0 });

  const summary = {
    audit: 'CONTRACT_AUDIT_001',
    analyzed: rows.length,
    correctos: stats.correctos,
    inconsistencias: stats.inconsistencias,
    focus: focusId,
    generatedAt: new Date().toISOString()
  };

  const resultsMd = [
    '# CONTRACT_AUDIT_001 - RESULTADOS',
    '',
    '## Resumen',
    '',
    `- Pedidos analizados: ${summary.analyzed}`,
    `- Correctos: ${summary.correctos}`,
    `- Inconsistencias: ${summary.inconsistencias}`,
    `- Pedido de foco: ${focusId}`,
    '',
    '## Tabla de auditoria',
    '',
    markdownTable(rows),
    '',
    '## Observaciones',
    '',
    '- `active_orders` y `today_orders` se tomaron del contrato de lectura.',
    '- `historical_orders` se tomo del mismo contrato.',
    '- `Panel` y `Driver` se derivan por heuristica de visibilidad operativa; no modifican datos.'
  ].join('\n');

  const evidenceMd = [
    '# CONTRACT_AUDIT_001 - EVIDENCIA',
    '',
    '## Capa de lectura',
    '',
    `- Pedido de foco: \`${focusId}\``,
    `- Pedidos muestreados: \`${rows.length}\``,
    `- Endpoint: \`/api/data-architecture/data-access\``,
    '',
    '## Reglas de interpretacion',
    '',
    '- `EN_CURSO` y `ENTREGADO` se consideran visibles para Driver.',
    '- `LISTO` y `PENDIENTE` se consideran visibles para Panel.',
    '- Un pedido certificado/entregado no deberia permanecer en `active_orders`.',
    '',
    '## Tabla resumida',
    '',
    markdownTable(rows)
  ].join('\n');

  await fs.promises.writeFile(resultsPath, resultsMd, 'utf8');
  await fs.promises.writeFile(evidencePath, evidenceMd, 'utf8');
  await fs.promises.writeFile(jsonPath, JSON.stringify({ summary, rows, contract: contractPayload }, null, 2), 'utf8');

  console.log(JSON.stringify({ summary, resultsPath, evidencePath, jsonPath }, null, 2));
}

main().catch((error) => {
  console.error('CONTRACT_AUDIT_001_ERROR', error.message);
  process.exit(1);
});
