import { auth } from './admin-firebase-config.js';
import { signInWithEmailAndPassword } from './local-auth.js';

const API_ORIGIN = (() => {
  const configured = String(window.__NELLY_DEVELOPER_API_ENDPOINT__ || '').trim().replace(/\/+$/, '');
  if (configured) return configured;
  const host = String(window.location?.hostname || '').toLowerCase();
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') {
    return window.location.origin;
  }
  return 'https://nelly-api-8lh1.onrender.com';
})();

const ui = {
  authForm: document.getElementById('governance-auth-form'),
  email: document.getElementById('governance-email'),
  password: document.getElementById('governance-password'),
  refresh: document.getElementById('governance-refresh'),
  message: document.getElementById('governance-message'),
  overallState: document.getElementById('governance-overall-state'),
  statusPill: document.getElementById('governance-status-pill'),
  entities: document.getElementById('gov-entities'),
  duplicities: document.getElementById('gov-duplicities'),
  publicWrites: document.getElementById('gov-public-writes'),
  ssot: document.getElementById('gov-ssot'),
  securityGate: document.getElementById('gov-security-gate'),
  lastAudit: document.getElementById('gov-last-audit'),
  healthScore: document.getElementById('gov-health-score'),
  healthLabel: document.getElementById('gov-health-label'),
  healthComponents: document.getElementById('gov-health-components'),
  indicatorsTable: document.getElementById('governance-indicators-table'),
  coexistenceTable: document.getElementById('governance-coexistence-table'),
  auditSeverity: document.getElementById('audit-severity'),
  auditCommerce: document.getElementById('audit-commerce'),
  auditCustomer: document.getElementById('audit-customer'),
  auditDriver: document.getElementById('audit-driver'),
  auditRefresh: document.getElementById('audit-refresh'),
  auditAlertsList: document.getElementById('audit-alerts-list'),
  auditDetail: document.getElementById('audit-detail'),
  modePill: document.getElementById('gov-mode-pill'),
  runtime: document.getElementById('gov-runtime'),
  businessSource: document.getElementById('gov-business-source'),
  liveSource: document.getElementById('gov-live-source'),
  failedReads: document.getElementById('gov-failed-reads'),
  exportJson: document.getElementById('developer-export-json'),
  exportCsv: document.getElementById('developer-export-csv'),
  snapshotDiscord: document.getElementById('developer-snapshot-discord')
};

const GOALS = {
  orders_rtdb_firestore: 'Eliminar despues del piloto',
  drivers_live_duplicates: 'Unificar nombre y propietario',
  finance_rtdb_firestore: 'Mantener sin duplicidad critica'
};

let lastGovernanceSnapshot = null;
let lastAuditPayload = null;

function setText(element, value) {
  if (element) element.textContent = String(value ?? '--');
}

function setState(element, label, type = 'pending') {
  if (!element) return;
  element.textContent = label;
  element.className = `wc-state wc-state-${type}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function formatDate(value) {
  if (!value) return '--';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '--';
  return date.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });
}

function totalGovernedEntities(snapshot) {
  const rtdb = Array.isArray(snapshot?.rtdb) ? snapshot.rtdb.length : 0;
  const firestore = Array.isArray(snapshot?.firestore) ? snapshot.firestore.length : 0;
  return rtdb + firestore;
}

function getOrderTimestamp(order = {}) {
  return Number(order.timestampActualizacion || order.finalizado_at || order.entregado_en || order.createdAt || order.created_at || order.fecha_creacion || order.fecha || order.timestamp || Date.now());
}

function getOrderState(order = {}) {
  return String(order?.estado_pedido || order?.estado || order?.logistica?.estado || '').trim().toLowerCase();
}

function renderAuditRow(left, right, meta = '') {
  return `<div><span>${escapeHtml(left)}</span><strong>${escapeHtml(right)}</strong>${meta ? `<small class="wc-muted">${escapeHtml(meta)}</small>` : ''}</div>`;
}

function normalizeAuditIndex(payload) {
  return payload?.audit_index?.history_index || { comercio: {}, cliente: {}, driver: {}, forma_pago: {}, incidencia: {} };
}

function triggeredCoexistence(snapshot) {
  return Array.isArray(snapshot?.coexistence)
    ? snapshot.coexistence.filter((item) => item.triggered)
    : [];
}

function resolveGate(snapshot) {
  const high = Number(snapshot?.summary?.highRiskDuplicities || 0);
  const failedReads = Number(snapshot?.summary?.failedReads || 0);
  const failedIndicators = Array.isArray(snapshot?.indicators)
    ? snapshot.indicators.filter((item) => item.ok === false).length
    : 0;
  if (high > 0 || failedIndicators > 0) return { label: 'FAIL', type: 'error' };
  if (failedReads > 0) return { label: 'WARN', type: 'pending' };
  return { label: 'PASS', type: 'active' };
}

function renderIndicators(snapshot) {
  const indicators = Array.isArray(snapshot?.indicators) ? snapshot.indicators : [];
  if (!ui.indicatorsTable) return;
  if (!indicators.length) {
    ui.indicatorsTable.innerHTML = '<tr><td colspan="4">Sin indicadores cargados.</td></tr>';
    return;
  }

  ui.indicatorsTable.innerHTML = indicators.map((item) => {
    const value = `${item.value ?? '--'}${item.unit || ''}`;
    return `
      <tr>
        <td><strong>${escapeHtml(item.label)}</strong><br><small class="wc-muted">${escapeHtml(item.details || '')}</small></td>
        <td>${escapeHtml(item.target || '--')}</td>
        <td>${escapeHtml(value)}</td>
        <td class="${item.ok ? 'pass' : 'fail'}">${item.ok ? 'PASS' : 'REVISAR'}</td>
      </tr>
    `;
  }).join('');
}

function renderHealth(snapshot) {
  const health = snapshot?.health || {};
  const score = Number.isFinite(Number(health.score)) ? Number(health.score) : null;
  setText(ui.healthScore, score === null ? '--%' : `${score}%`);
  setState(ui.healthLabel, health.label || 'Pendiente', health.state || 'pending');

  const components = Array.isArray(health.components) ? health.components : [];
  if (!ui.healthComponents) return;
  if (!components.length) {
    ui.healthComponents.innerHTML = '<div><span>Sin componentes</span><small>Esperando auditoria</small></div>';
    return;
  }

  ui.healthComponents.innerHTML = components.map((item) => `
    <div>
      <span><strong>${escapeHtml(item.label)}</strong></span>
      <small>${escapeHtml(item.value)}/${escapeHtml(item.weight)} pts</small>
    </div>
  `).join('');
}

function renderCoexistence(snapshot) {
  const rows = Array.isArray(snapshot?.coexistence) ? snapshot.coexistence : [];
  if (!rows.length) {
    ui.coexistenceTable.innerHTML = '<tr><td colspan="3">Sin reglas de coexistencia cargadas.</td></tr>';
    return;
  }

  ui.coexistenceTable.innerHTML = rows.map((item) => {
    const state = item.triggered
      ? (item.severity === 'high' ? 'Atencion critica' : 'Vigilar')
      : 'Sin duplicidad critica';
    const goal = GOALS[item.id] || 'Mantener bajo vigilancia';
    return `
      <tr>
        <td><strong>${escapeHtml(item.id)}</strong><br><small class="wc-muted">${escapeHtml(item.domain || 'Dato')}</small></td>
        <td>${escapeHtml(state)}</td>
        <td>${escapeHtml(goal)}</td>
      </tr>
    `;
  }).join('');
}

function buildAuditAlerts(payload = {}) {
  const history = Array.isArray(payload?.historical_orders) ? payload.historical_orders : [];
  const auditIndex = normalizeAuditIndex(payload);
  const commerceFilter = String(ui.auditCommerce?.value || '').trim().toLowerCase();
  const customerFilter = String(ui.auditCustomer?.value || '').trim().toLowerCase();
  const driverFilter = String(ui.auditDriver?.value || '').trim().toLowerCase();
  const severityFilter = String(ui.auditSeverity?.value || '').trim().toLowerCase();

  const alerts = [];

  history.forEach((order) => {
    const commerce = String(order?.comercio?.nombre || order?.tienda?.nombre || order?.comercio_nombre || order?.tienda_nombre || '').trim();
    const customer = String(order?.cliente_nombre || order?.cliente?.nombre || order?.cliente || '').trim();
    const driver = String(order?.repartidor_nombre || order?.repartidor?.nombre || order?.repartidor_id || order?.driverUid || '').trim();
    const payment = String(order?.metodo_pago || order?.forma_pago || order?.pago?.metodo || order?.pago?.tipo || '').trim().toLowerCase();
    const state = getOrderState(order);
    const amount = Number(order?.monto_total || order?.total || order?.monto || 0);
    const timeSpent = Number(order?.tiempo_promedio_entrega || order?.tiempo_entrega || 0);
    const incident = String(order?.incidencia_tipo || order?.causa_raiz || order?.tipo_incidencia || '').trim();

    if (commerceFilter && !commerce.toLowerCase().includes(commerceFilter)) return;
    if (customerFilter && !customer.toLowerCase().includes(customerFilter)) return;
    if (driverFilter && !driver.toLowerCase().includes(driverFilter)) return;

    if (state === 'entregado' && payment === 'efectivo' && !String(order?.pago?.estado || '').trim()) {
      alerts.push({ severity: 'critical', title: 'Pedido entregado sin cobro registrado', order, commerce, customer, driver, amount });
    }
    if (state === 'cancelado' && amount > 0) {
      alerts.push({ severity: 'operational', title: 'Pedido cancelado con importe registrado', order, commerce, customer, driver, amount });
    }
    if (timeSpent > 30) {
      alerts.push({ severity: 'operational', title: 'Pedido fuera del SLA', order, commerce, customer, driver, amount });
    }
    if (incident) {
      alerts.push({ severity: 'quality', title: 'Pedido con incidencia histórica', order, commerce, customer, driver, amount });
    }
  });

  const seen = new Set();
  const filtered = alerts.filter((alert) => {
    const key = `${alert.severity}:${alert.title}:${alert.order?.id || alert.order?.pedido_id || alert.order?.id_pedido || ''}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return !severityFilter || alert.severity === severityFilter;
  });

  return {
    alerts: filtered,
    auditIndex
  };
}

function renderAuditDetail(order) {
  if (!ui.auditDetail) return;
  if (!order) {
    ui.auditDetail.innerHTML = '<div><span>Selecciona una alerta</span><strong>Detalle</strong></div>';
    return;
  }
  const timestamp = new Date(getOrderTimestamp(order)).toLocaleString('es-MX', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  ui.auditDetail.innerHTML = [
    renderAuditRow('Pedido', String(order.shortId || order.id_pedido || order.id || 'sin id')),
    renderAuditRow('Fecha', timestamp),
    renderAuditRow('Estado', String(order.estado_pedido || order.estado || order?.logistica?.estado || 'sin estado')),
    renderAuditRow('Comercio', String(order?.comercio?.nombre || order?.tienda?.nombre || order?.comercio_nombre || order?.tienda_nombre || 'sin comercio')),
    renderAuditRow('Cliente', String(order?.cliente_nombre || order?.cliente?.nombre || order?.cliente || 'sin cliente')),
    renderAuditRow('Repartidor', String(order?.repartidor_nombre || order?.repartidor?.nombre || order?.repartidor_id || order?.driverUid || 'sin repartidor'))
  ].join('');
}

function renderAudit(snapshot) {
  const payload = lastAuditPayload || {};
  const { alerts, auditIndex } = buildAuditAlerts(payload);
  const groups = {
    critical: alerts.filter((item) => item.severity === 'critical'),
    operational: alerts.filter((item) => item.severity === 'operational'),
    quality: alerts.filter((item) => item.severity === 'quality')
  };

  if (ui.auditAlertsList) {
    ui.auditAlertsList.innerHTML = alerts.length
      ? [
          renderAuditRow('Comercios', String(Object.keys(auditIndex.comercio || {}).length), 'history_index'),
          renderAuditRow('Clientes', String(Object.keys(auditIndex.cliente || {}).length), 'history_index'),
          groups.critical.length ? renderAuditRow('Criticas', `${groups.critical.length} alertas`, 'Revisar primero') : '',
          groups.operational.length ? renderAuditRow('Operativas', `${groups.operational.length} alertas`, 'SLA / retrasos') : '',
          groups.quality.length ? renderAuditRow('Calidad', `${groups.quality.length} alertas`, 'Evidencia / datos') : ''
        ].join('')
      : '<div><span>Sin alertas historicas</span><strong>NAE</strong></div>';
  }

  renderAuditDetail(alerts[0]?.order || null);
}

function renderSnapshot(snapshot) {
  lastGovernanceSnapshot = snapshot;
  const duplicities = triggeredCoexistence(snapshot);
  const high = Number(snapshot?.summary?.highRiskDuplicities || 0);
  const failedReads = Number(snapshot?.summary?.failedReads || 0);
  const failedIndicators = Array.isArray(snapshot?.indicators)
    ? snapshot.indicators.filter((item) => item.ok === false).length
    : 0;
  const gate = resolveGate(snapshot);

  setText(ui.entities, totalGovernedEntities(snapshot));
  setText(ui.duplicities, duplicities.length);
  setText(ui.publicWrites, '0');
  setText(ui.ssot, high);
  setText(ui.securityGate, gate.label);
  setText(ui.lastAudit, formatDate(snapshot?.generatedAt));

  setText(ui.runtime, snapshot?.mode || 'pilot_rtdb_baseline');
  setText(ui.businessSource, snapshot?.target?.businessPersistence || '--');
  setText(ui.liveSource, snapshot?.target?.liveOperations || '--');
  setText(ui.failedReads, failedReads);

  setState(ui.statusPill, high > 0 ? 'Atencion' : (duplicities.length ? 'Vigilar' : 'OK'), high > 0 ? 'error' : (duplicities.length ? 'pending' : 'active'));
  setState(ui.overallState, gate.label, gate.type);
  setState(ui.modePill, snapshot?.mode === 'pilot_rtdb_baseline' ? 'Piloto' : 'Objetivo', 'active');

  renderHealth(snapshot);
  renderIndicators(snapshot);
  renderCoexistence(snapshot);
  renderAudit(snapshot);

  const message = high > 0 || failedIndicators > 0
    ? 'La auditoria detecto violaciones SSOT de alto riesgo. No avanzar sin revisar.'
    : `Auditoria cargada. Duplicidades en vigilancia: ${duplicities.length}. Escrituras criticas desde public: 0.`;
  setText(ui.message, message);
}

function renderUnavailable(error) {
  setText(ui.entities, '--');
  setText(ui.duplicities, '--');
  setText(ui.publicWrites, '--');
  setText(ui.ssot, '--');
  setText(ui.securityGate, 'PENDIENTE');
  setText(ui.lastAudit, '--');
  setText(ui.runtime, 'Sin snapshot');
  setText(ui.businessSource, '--');
  setText(ui.liveSource, '--');
  setText(ui.failedReads, '--');
  setText(ui.healthScore, '--%');
  setState(ui.statusPill, 'Requiere acceso', 'pending');
  setState(ui.overallState, 'Pendiente', 'pending');
  setState(ui.healthLabel, 'Pendiente', 'pending');
  if (ui.healthComponents) {
    ui.healthComponents.innerHTML = '<div><span>Sin score</span><small>Autentica o refresca la auditoria</small></div>';
  }
  if (ui.indicatorsTable) {
    ui.indicatorsTable.innerHTML = '<tr><td colspan="4">Autentica una cuenta tecnica para cargar indicadores.</td></tr>';
  }
  ui.coexistenceTable.innerHTML = '<tr><td colspan="3">Autentica una cuenta tecnica para cargar el diagnostico protegido.</td></tr>';
  setText(ui.message, `No se pudo cargar Gobierno de Datos: ${error.message}`);
}

async function getAuthHeader({ withLogin = false } = {}) {
  if (withLogin) {
    const email = ui.email?.value || '';
    const password = ui.password?.value || '';
    const result = await signInWithEmailAndPassword(auth, email, password);
    const token = await result.user.getIdToken();
    return { Authorization: `Bearer ${token}` };
  }

  const user = auth.currentUser;
  if (!user) return {};
  const token = await user.getIdToken();
  return { Authorization: `Bearer ${token}` };
}

async function fetchGovernance({ withLogin = false } = {}) {
  setText(ui.message, 'Consultando diagnostico de arquitectura de datos...');
  setState(ui.statusPill, 'Cargando', 'processing');

  const headers = await getAuthHeader({ withLogin });
  const [response, auditResponse] = await Promise.all([
    fetch(`${API_ORIGIN}/api/data-architecture/status`, { headers }),
    fetch(`${API_ORIGIN}/api/data-architecture/data-access`, { headers })
  ]);
  const payload = await response.json().catch(() => ({}));
  const auditPayload = await auditResponse.json().catch(() => ({}));

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  if (!auditResponse.ok || auditPayload?.ok === false) {
    throw new Error(auditPayload?.error || `HTTP ${auditResponse.status}`);
  }

  lastAuditPayload = auditPayload;
  renderSnapshot(payload);
  return payload;
}

function downloadFile(name, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function snapshotToCsv(payload = {}) {
  const summary = payload?.summary || {};
  const health = payload?.health || {};
  const rows = [
    ['campo', 'valor'],
    ['mode', payload?.mode || ''],
    ['status', summary.status || ''],
    ['highRiskDuplicities', summary.highRiskDuplicities ?? ''],
    ['warnings', summary.warnings ?? ''],
    ['failedReads', summary.failedReads ?? ''],
    ['healthScore', health.score ?? ''],
    ['healthLabel', health.label || '']
  ];
  return rows.map((row) => row.map((cell) => String(cell).replaceAll('"', '""')).join(',')).join('\n');
}

async function exportGovernanceJson() {
  const payload = await fetchGovernance();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(`auditoria_nelly_${stamp}.json`, JSON.stringify(payload, null, 2), 'application/json');
}

async function exportGovernanceCsv() {
  const payload = await fetchGovernance();
  const stamp = new Date().toISOString().replace(/[:.]/g, '-');
  downloadFile(`auditoria_nelly_${stamp}.csv`, snapshotToCsv(payload), 'text/csv');
}

async function sendSnapshotDiscord() {
  const payload = await fetchGovernance();
  const response = await fetch(`${API_ORIGIN}/api/monitoreo/discord`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      content: `Snapshot Developer (${location.pathname}):\n\n${'```json\n' + JSON.stringify(payload, null, 2) + '\n```'}`
    })
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
}

ui.authForm?.addEventListener('submit', async (event) => {
  event.preventDefault();
  try {
    await fetchGovernance({ withLogin: true });
  } catch (error) {
    renderUnavailable(error);
  }
});

ui.refresh?.addEventListener('click', async () => {
  try {
    await fetchGovernance();
  } catch (error) {
    renderUnavailable(error);
  }
});

ui.exportJson?.addEventListener('click', () => exportGovernanceJson().catch((error) => renderUnavailable(error)));
ui.exportCsv?.addEventListener('click', () => exportGovernanceCsv().catch((error) => renderUnavailable(error)));
ui.snapshotDiscord?.addEventListener('click', () => sendSnapshotDiscord().catch((error) => renderUnavailable(error)));
ui.auditRefresh?.addEventListener('click', async () => {
  try {
    await fetchGovernance();
  } catch (error) {
    renderUnavailable(error);
  }
});
ui.auditSeverity?.addEventListener('change', () => fetchGovernance().catch((error) => renderUnavailable(error)));
ui.auditCommerce?.addEventListener('input', () => fetchGovernance().catch((error) => renderUnavailable(error)));
ui.auditCustomer?.addEventListener('input', () => fetchGovernance().catch((error) => renderUnavailable(error)));
ui.auditDriver?.addEventListener('input', () => fetchGovernance().catch((error) => renderUnavailable(error)));

window.addEventListener('nelly:work-center-authenticated', async () => {
  try {
    await fetchGovernance();
  } catch (error) {
    renderUnavailable(error);
  }
});

fetchGovernance().catch((error) => renderUnavailable(error));
