import { auth } from './admin-firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const ui = {
  loginSection: document.getElementById('login-section'),
  dashboardSection: document.getElementById('dashboard-section'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginError: document.getElementById('login-error'),
  btnRefresh: document.getElementById('btn-refresh'),
  dashboardStatus: document.getElementById('dashboard-status'),
  overviewPedidosActivos: document.getElementById('overview-pedidos-activos'),
  overviewRepartidores: document.getElementById('overview-repartidores'),
  overviewVentasBrutas: document.getElementById('overview-ventas-brutas'),
  overviewComisiones: document.getElementById('overview-comisiones'),
  auditSignal: document.getElementById('audit-signal'),
  auditSummary: document.getElementById('audit-summary'),
  metricsSignal: document.getElementById('metrics-signal'),
  metricsSummary: document.getElementById('metrics-summary'),
  financeSignal: document.getElementById('finance-signal'),
  financeSummary: document.getElementById('finance-summary'),
  notificationSignal: document.getElementById('notification-signal'),
  notificationSummary: document.getElementById('notification-summary'),
  aiSignal: document.getElementById('ai-signal'),
  aiSummary: document.getElementById('ai-summary'),
  healthSignal: document.getElementById('health-signal'),
  healthSummary: document.getElementById('health-summary'),
  projectionAudit: document.getElementById('projection-audit'),
  projectionMetrics: document.getElementById('projection-metrics'),
  projectionFinance: document.getElementById('projection-finance'),
  projectionSummary: document.getElementById('projection-summary')
};

const AUTHORIZED_ADMIN_EMAILS = new Set([
  'admin@nellydelivery.com',
  'operaciones@nellydelivery.com'
]);

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function showLogin() {
  ui.dashboardSection.classList.add('hidden');
  ui.loginSection.classList.remove('hidden');
}

function showDashboard() {
  ui.loginSection.classList.add('hidden');
  ui.dashboardSection.classList.remove('hidden');
}

function setLoginError(message) {
  if (!message) {
    ui.loginError.classList.add('hidden');
    ui.loginError.textContent = '';
    return;
  }
  ui.loginError.textContent = message;
  ui.loginError.classList.remove('hidden');
}

async function fetchOperationalDashboard() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sesion no activa');
  }

  const token = await user.getIdToken();
  const response = await fetch('/api/admin/dashboard/operativo', {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json();
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload;
}

function renderSnapshot(snapshot) {
  ui.dashboardStatus.textContent = snapshot?.ok ? 'GREEN' : 'UNHEALTHY';
  ui.dashboardStatus.className = snapshot?.ok
    ? 'mt-1 text-2xl font-bold text-ops-accent'
    : 'mt-1 text-2xl font-bold text-red-300';

  ui.overviewPedidosActivos.textContent = String(snapshot?.overview?.pedidos_activos ?? 0);
  ui.overviewRepartidores.textContent = String(snapshot?.overview?.repartidores ?? 0);
  ui.overviewVentasBrutas.textContent = money(snapshot?.overview?.ventas_brutas ?? 0);
  ui.overviewComisiones.textContent = money(snapshot?.overview?.comisiones_nelly ?? 0);

  ui.auditSignal.textContent = snapshot?.projections?.audit?.signal || 'Sin señal';
  ui.auditSummary.textContent = `Eventos: ${snapshot?.projections?.audit?.summary?.total_eventos ?? 0} · Entregas: ${snapshot?.projections?.audit?.summary?.entregas_registradas ?? 0}`;

  ui.metricsSignal.textContent = snapshot?.projections?.metrics?.signal || 'Sin señal';
  ui.metricsSummary.textContent = `Entregas hoy: ${snapshot?.projections?.metrics?.summary?.pedido_entregado ?? 0} · Eventos: ${snapshot?.projections?.metrics?.summary?.total_eventos ?? 0}`;

  ui.financeSignal.textContent = snapshot?.projections?.finance?.ledger?.reconciled ? 'Ledger conciliado' : 'Ledger pendiente';
  ui.financeSummary.textContent = `Ventas: ${money(snapshot?.projections?.finance?.summary?.ventas_brutas ?? 0)} · Comisión: ${money(snapshot?.projections?.finance?.summary?.comisiones_nelly ?? 0)}`;

  ui.notificationSignal.textContent = `${snapshot?.projections?.notification?.summary?.active ?? 0} notificaciones proyectadas`;
  ui.notificationSummary.textContent = `Canal push: ${snapshot?.projections?.notification?.summary?.byChannel?.push ?? 0}`;

  ui.aiSignal.textContent = snapshot?.projections?.ai?.insights?.[0]?.recommendation || 'Sin recomendacion';
  ui.aiSummary.textContent = `Score: ${snapshot?.projections?.ai?.insights?.[0]?.score ?? 0}`;

  ui.healthSignal.textContent = snapshot?.health?.backend ? 'Backend saludable' : 'Backend no validado';
  ui.healthSummary.textContent = [
    `RTDB: ${snapshot?.health?.rtdb ? 'OK' : 'NO'}`,
    `Sincronizacion: ${snapshot?.health?.sincronizacion ? 'OK' : 'NO'}`,
    `Ledger: ${snapshot?.health?.ledger ? 'OK' : 'NO'}`,
    `Finanzas: ${snapshot?.health?.finanzas ? 'OK' : 'NO'}`
  ].join(' · ');

  ui.projectionAudit.textContent = snapshot?.projections?.audit?.signal || '-';
  ui.projectionMetrics.textContent = snapshot?.projections?.metrics?.signal || '-';
  ui.projectionFinance.textContent = snapshot?.projections?.finance?.ledger?.reconciled ? 'reconciled' : 'pending';
  ui.projectionSummary.textContent = snapshot?.source || 'S4_OPERATIVE_DASHBOARD';
}

async function refreshDashboard() {
  try {
    const snapshot = await fetchOperationalDashboard();
    renderSnapshot(snapshot);
  } catch (error) {
    ui.dashboardStatus.textContent = 'ERROR';
    ui.dashboardStatus.className = 'mt-1 text-2xl font-bold text-red-300';
    ui.projectionSummary.textContent = error.message;
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoginError('');

  const email = String(ui.loginEmail.value || '').trim().toLowerCase();
  const password = String(ui.loginPassword.value || '');

  if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
    setLoginError('Correo no autorizado para el dashboard operativo.');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setLoginError(`No fue posible iniciar sesion: ${error.message}`);
  }
});

ui.btnRefresh.addEventListener('click', refreshDashboard);

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    showLogin();
    return;
  }

  const email = String(user.email || '').toLowerCase();
  if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
    await signOut(auth);
    setLoginError('Sesion cerrada: correo no autorizado.');
    showLogin();
    return;
  }

  showDashboard();
  await refreshDashboard();
});
