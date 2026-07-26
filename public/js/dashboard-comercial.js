import { auth } from './admin-firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from './local-auth.js';

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
  kpiEntregasPuntuales: document.getElementById('kpi-entregas-puntuales'),
  c4OportunitiesTotal: document.getElementById('c4-oportunities-total'),
  c4CustomersRisk: document.getElementById('c4-customers-risk'),
  c4CommercesRisk: document.getElementById('c4-commerces-risk'),
  c4ActionsTotal: document.getElementById('c4-actions-total'),
  c4OpportunitiesList: document.getElementById('c4-opportunities-list'),
  c4ActionsList: document.getElementById('c4-actions-list'),
  c5PromotionsTotal: document.getElementById('c5-promotions-total'),
  c5ReactivationTotal: document.getElementById('c5-reactivation-total'),
  c5FollowupTotal: document.getElementById('c5-followup-total'),
  c5PromotionsList: document.getElementById('c5-promotions-list')
};

const AUTHORIZED_ADMIN_EMAILS = new Set([
  'admin@nellydelivery.com',
  'operaciones@nellydelivery.com'
]);

const API_ORIGIN = (() => {
  const host = String(window.location?.hostname || '').toLowerCase();
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') {
    return window.location.origin;
  }
  return 'https://nelly-api-8lh1.onrender.com';
})();

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function badgeClass(priority) {
  if (priority === 'alta') return 'text-amber-300';
  if (priority === 'media') return 'text-comm-warn';
  return 'text-comm-accent';
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
  const response = await fetch(`${API_ORIGIN}/api/admin/dashboard/operativo`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json();
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload;
}

function renderOpportunityCard(item) {
  return `
    <article class="rounded-xl border border-comm-line bg-slate-950/40 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">${item.tipo}</p>
          <h4 class="text-lg font-semibold ${badgeClass(item.prioridad)}">${item.titulo}</h4>
        </div>
        <div class="rounded-full border border-comm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${item.prioridad || 'baja'}</div>
      </div>
      <p class="mt-3 text-sm text-slate-200">${item.descripcion}</p>
      <p class="mt-2 text-xs text-slate-400">${item.evidencia}</p>
    </article>
  `;
}

function renderActionCard(item) {
  return `
    <article class="rounded-xl border border-comm-line bg-slate-950/40 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Accion sugerida</p>
          <h4 class="text-lg font-semibold text-comm-info">${item.titulo}</h4>
        </div>
        <div class="rounded-full border border-comm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${item.accion}</div>
      </div>
      <p class="mt-3 text-sm text-slate-200">${item.evidencia}</p>
    </article>
  `;
}

function renderPromotionCard(item) {
  return `
    <article class="rounded-xl border border-comm-line bg-slate-950/40 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Promocion ligera</p>
          <h4 class="text-lg font-semibold text-comm-accent">${item.titulo}</h4>
        </div>
        <div class="rounded-full border border-comm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${item.promocion}</div>
      </div>
      <p class="mt-3 text-sm text-slate-200">${item.evidencia}</p>
    </article>
  `;
}

function renderEmptyState(title, body) {
  return `
    <div class="nelly-empty-state">
      <p class="nelly-empty-state__title">${title}</p>
      <p class="nelly-empty-state__body">${body}</p>
    </div>
  `;
}

function renderCommercial(snapshot) {
  const commercial = snapshot?.projections?.commercial || {};
  const summary = commercial?.summary || {};
  const alerts = commercial?.alerts || [];
  const market = snapshot?.projections?.marketplace || {};
  const c4 = snapshot?.projections?.commercial_insights || {};
  const c4Opportunities = Array.isArray(c4?.opportunities) ? c4.opportunities : [];
  const c4Actions = Array.isArray(c4?.actions) ? c4.actions : [];
  const c5Promotions = Array.isArray(c4?.promotions) ? c4.promotions : [];

  ui.dashboardStatus.textContent = commercial?.signal === 'operacion_comercial_estable'
    ? 'ESTABLE'
    : 'CON ALERTAS';
  ui.dashboardStatus.className = commercial?.signal === 'operacion_comercial_estable'
    ? 'nelly-state nelly-state--success mt-1 text-2xl font-bold text-comm-accent'
    : 'nelly-state nelly-state--warn mt-1 text-2xl font-bold text-comm-warn';

  ui.overviewVentasDia.textContent = money(summary.ventas_dia ?? 0);
  ui.overviewPedidosActivos.textContent = String(summary.pedidos_en_proceso ?? snapshot?.overview?.pedidos_activos ?? 0);
  ui.overviewTicketPromedio.textContent = money(summary.ticket_promedio ?? 0);
  ui.overviewClientesRecurrentes.textContent = String(summary.clientes_recurrentes ?? 0);

  ui.operationSignal.textContent = commercial?.signal || 'Sin datos';
  ui.operationSummary.textContent = commercial?.signal
    ? `Ventas hoy: ${money(summary.ventas_dia ?? 0)} · Pedidos recibidos: ${summary.pedidos_recibidos ?? 0} · Entregados: ${summary.pedidos_entregados ?? 0}`
    : 'Esperando actividad comercial suficiente para generar señales.';

  ui.alertsSignal.textContent = alerts.length > 0 ? `${alerts.length} alertas` : 'Sin alertas';
  ui.alertsSummary.textContent = alerts.length > 0
    ? alerts.join(' · ')
    : 'Sin señales de atención comercial por ahora.';

  ui.financeSignal.textContent = `${summary.estado_liquidaciones || 'pendientes'}`;
  ui.financeSummary.textContent = `Ingresos: ${money(summary.ingresos_comercio ?? 0)} · Comisiones: ${money(summary.comisiones ?? 0)} · Ganancia estimada: ${money(summary.ganancia_estimada ?? 0)}`;

  ui.opsSignal.textContent = summary.tiempo_promedio_entrega > 0 ? 'Operación visible' : 'Sin operación suficiente';
  ui.opsSummary.textContent = summary.tiempo_promedio_entrega > 0
    ? `Aceptación promedio: ${summary.tiempo_promedio_aceptacion ?? 0} min · Entrega promedio: ${summary.tiempo_promedio_entrega ?? 0} min · Entregas puntuales: ${summary.entregas_puntuales_pct ?? 0}%`
    : 'Todavía no hay volumen suficiente para calcular tendencias operativas confiables.';

  ui.marketSignal.textContent = market?.signal || 'Sin datos';
  ui.marketSummary.textContent = `Comercios: ${market?.summary?.comercios ?? 0} · Productos: ${market?.summary?.productos ?? 0} · Disponibles: ${market?.summary?.productos_disponibles ?? 0}`;

  ui.kpiVentasMes.textContent = money(summary.ventas_mes ?? 0);
  ui.kpiPedidosEntregados.textContent = String(summary.pedidos_entregados ?? 0);
  ui.kpiFrecuenciaCompra.textContent = Number(summary.frecuencia_compra ?? 0).toFixed(2);
  ui.kpiEntregasPuntuales.textContent = `${Number(summary.entregas_puntuales_pct ?? 0).toFixed(0)}%`;

  ui.c4OportunitiesTotal.textContent = String(c4?.summary?.oportunidades_totales ?? c4Opportunities.length ?? 0);
  ui.c4CustomersRisk.textContent = String(c4?.summary?.clientes_en_riesgo ?? 0);
  ui.c4CommercesRisk.textContent = String(c4?.summary?.comercios_en_riesgo ?? 0);
  ui.c4ActionsTotal.textContent = String(c4Actions.length);

  ui.c4OpportunitiesList.innerHTML = c4Opportunities.length > 0
    ? c4Opportunities.map(renderOpportunityCard).join('')
    : renderEmptyState(
      'Sin oportunidades aún',
      'Cuando el sistema detecte clientes o comercios con valor de seguimiento, las oportunidades aparecerán aquí.'
    );

  ui.c4ActionsList.innerHTML = c4Actions.length > 0
    ? c4Actions.map(renderActionCard).join('')
    : renderEmptyState(
      'Sin acciones sugeridas',
      'El motor comercial aún no requiere acciones concretas sobre esta lectura.'
    );

  ui.c5PromotionsTotal.textContent = String(c5Promotions.length);
  ui.c5ReactivationTotal.textContent = String(c5Promotions.filter((item) => item.promocion === 'reactivacion_manual_prioritaria').length);
  ui.c5FollowupTotal.textContent = String(c5Promotions.filter((item) => item.promocion !== 'reactivacion_manual_prioritaria').length);
  ui.c5PromotionsList.innerHTML = c5Promotions.length > 0
    ? c5Promotions.map(renderPromotionCard).join('')
    : renderEmptyState(
      'Sin promociones ligeras',
      'No hay promociones sugeridas para esta lectura. Cuando existan, se mostrarán aquí.'
    );
}

async function refreshDashboard() {
  try {
    const snapshot = await fetchCommercialDashboard();
    renderCommercial(snapshot);
  } catch (error) {
    ui.dashboardStatus.textContent = 'ERROR';
    ui.dashboardStatus.className = 'nelly-state nelly-state--danger mt-1 text-2xl font-bold text-red-300';
    ui.alertsSummary.textContent = `No se pudo cargar el snapshot comercial: ${error.message}`;
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
