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
  coexistenceTable: document.getElementById('governance-coexistence-table'),
  modePill: document.getElementById('gov-mode-pill'),
  runtime: document.getElementById('gov-runtime'),
  businessSource: document.getElementById('gov-business-source'),
  liveSource: document.getElementById('gov-live-source'),
  failedReads: document.getElementById('gov-failed-reads')
};

const GOALS = {
  orders_rtdb_firestore: 'Eliminar despues del piloto',
  drivers_live_duplicates: 'Unificar nombre y propietario',
  finance_rtdb_firestore: 'Mantener sin duplicidad critica'
};

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

function triggeredCoexistence(snapshot) {
  return Array.isArray(snapshot?.coexistence)
    ? snapshot.coexistence.filter((item) => item.triggered)
    : [];
}

function resolveGate(snapshot) {
  const high = Number(snapshot?.summary?.highRiskDuplicities || 0);
  const failedReads = Number(snapshot?.summary?.failedReads || 0);
  if (high > 0) return { label: 'FAIL', type: 'error' };
  if (failedReads > 0) return { label: 'WARN', type: 'pending' };
  return { label: 'PASS', type: 'active' };
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

function renderSnapshot(snapshot) {
  const duplicities = triggeredCoexistence(snapshot);
  const high = Number(snapshot?.summary?.highRiskDuplicities || 0);
  const failedReads = Number(snapshot?.summary?.failedReads || 0);
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

  renderCoexistence(snapshot);

  const message = high > 0
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
  setState(ui.statusPill, 'Requiere acceso', 'pending');
  setState(ui.overallState, 'Pendiente', 'pending');
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
  const response = await fetch(`${API_ORIGIN}/api/data-architecture/status`, { headers });
  const payload = await response.json().catch(() => ({}));

  if (!response.ok || payload?.ok === false) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  renderSnapshot(payload);
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

fetchGovernance().catch((error) => renderUnavailable(error));
