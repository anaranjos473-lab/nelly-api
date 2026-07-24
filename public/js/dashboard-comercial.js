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
  overviewVentasDia: document.getElementById('overview-ventas-dia'),
  overviewPedidosActivos: document.getElementById('overview-pedidos-activos'),
  overviewTicketPromedio: document.getElementById('overview-ticket-promedio'),
  overviewClientesRecurrentes: document.getElementById('overview-clientes-recurrentes'),
  operationSignal: document.getElementById('operation-signal'),
  operationSummary: document.getElementById('operation-summary'),
  alertsSignal: document.getElementById('alerts-signal'),
  alertsSummary: document.getElementById('alerts-summary'),
  financeSignal: document.getElementById('finance-signal'),
  financeSummary: document.getElementById('finance-summary'),
  opsSignal: document.getElementById('ops-signal'),
  opsSummary: document.getElementById('ops-summary'),
  marketSignal: document.getElementById('market-signal'),
  marketSummary: document.getElementById('market-summary'),
  kpiVentasMes: document.getElementById('kpi-ventas-mes'),
  kpiPedidosEntregados: document.getElementById('kpi-pedidos-entregados'),
  kpiFrecuenciaCompra: document.getElementById('kpi-frecuencia-compra'),
  kpiEntregasPuntuales: document.getElementById('kpi-entregas-puntuales')
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

async function fetchCommercialDashboard() {
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

function renderCommercial(snapshot) {
  const commercial = snapshot?.projections?.commercial || {};
  const summary = commercial?.summary || {};
  const alerts = commercial?.alerts || [];
  const market = snapshot?.projections?.marketplace || {};

  ui.dashboardStatus.textContent = commercial?.signal === 'operacion_comercial_estable'
    ? 'ESTABLE'
    : 'CON ALERTAS';
  ui.dashboardStatus.className = commercial?.signal === 'operacion_comercial_estable'
    ? 'mt-1 text-2xl font-bold text-comm-accent'
    : 'mt-1 text-2xl font-bold text-comm-warn';

  ui.overviewVentasDia.textContent = money(summary.ventas_dia ?? 0);
  ui.overviewPedidosActivos.textContent = String(summary.pedidos_en_proceso ?? snapshot?.overview?.pedidos_activos ?? 0);
  ui.overviewTicketPromedio.textContent = money(summary.ticket_promedio ?? 0);
  ui.overviewClientesRecurrentes.textContent = String(summary.clientes_recurrentes ?? 0);

  ui.operationSignal.textContent = commercial?.signal || 'Sin datos';
  ui.operationSummary.textContent = `Ventas hoy: ${money(summary.ventas_dia ?? 0)} · Pedidos recibidos: ${summary.pedidos_recibidos ?? 0} · Entregados: ${summary.pedidos_entregados ?? 0}`;

  ui.alertsSignal.textContent = alerts.length > 0 ? `${alerts.length} alertas` : 'Sin alertas';
  ui.alertsSummary.textContent = alerts.length > 0
    ? alerts.join(' · ')
    : 'Sin señales de atención comercial.';

  ui.financeSignal.textContent = `${summary.estado_liquidaciones || 'pendientes'}`;
  ui.financeSummary.textContent = `Ingresos: ${money(summary.ingresos_comercio ?? 0)} · Comisiones: ${money(summary.comisiones ?? 0)} · Ganancia estimada: ${money(summary.ganancia_estimada ?? 0)}`;

  ui.opsSignal.textContent = summary.tiempo_promedio_entrega > 0 ? 'Operación visible' : 'Sin operación suficiente';
  ui.opsSummary.textContent = `Aceptación promedio: ${summary.tiempo_promedio_aceptacion ?? 0} min · Entrega promedio: ${summary.tiempo_promedio_entrega ?? 0} min · Entregas puntuales: ${summary.entregas_puntuales_pct ?? 0}%`;

  ui.marketSignal.textContent = market?.signal || 'Sin datos';
  ui.marketSummary.textContent = `Comercios: ${market?.summary?.comercios ?? 0} · Productos: ${market?.summary?.productos ?? 0} · Disponibles: ${market?.summary?.productos_disponibles ?? 0}`;

  ui.kpiVentasMes.textContent = money(summary.ventas_mes ?? 0);
  ui.kpiPedidosEntregados.textContent = String(summary.pedidos_entregados ?? 0);
  ui.kpiFrecuenciaCompra.textContent = Number(summary.frecuencia_compra ?? 0).toFixed(2);
  ui.kpiEntregasPuntuales.textContent = `${Number(summary.entregas_puntuales_pct ?? 0).toFixed(0)}%`;
}

async function refreshDashboard() {
  try {
    const snapshot = await fetchCommercialDashboard();
    renderCommercial(snapshot);
  } catch (error) {
    ui.dashboardStatus.textContent = 'ERROR';
    ui.dashboardStatus.className = 'mt-1 text-2xl font-bold text-red-300';
    ui.alertsSummary.textContent = error.message;
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoginError('');

  const email = String(ui.loginEmail.value || '').trim().toLowerCase();
  const password = String(ui.loginPassword.value || '');

  if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
    setLoginError('Correo no autorizado para el dashboard comercial.');
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
