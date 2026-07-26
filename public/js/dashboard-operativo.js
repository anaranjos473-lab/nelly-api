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
  controlStatus: document.getElementById('ops-control-status'),
  latency: document.getElementById('ops-latency'),
  overviewPedidosActivos: document.getElementById('overview-pedidos-activos'),
  overviewRepartidores: document.getElementById('overview-repartidores'),
  overviewRepartidoresTotal: document.getElementById('overview-repartidores-total'),
  overviewTiempoEntrega: document.getElementById('overview-tiempo-entrega'),
  overviewZonas: document.getElementById('overview-zonas'),
  overviewZonasLabel: document.getElementById('overview-zonas-label'),
  overviewSatisfaccion: document.getElementById('overview-satisfaccion'),
  overviewVentasBrutas: document.getElementById('overview-ventas-brutas'),
  overviewComisiones: document.getElementById('overview-comisiones'),
  overviewFinance: document.getElementById('overview-finance'),
  kpiOrdersDelta: document.getElementById('kpi-orders-delta'),
  kpiDriversDelta: document.getElementById('kpi-drivers-delta'),
  tabActiveCount: document.getElementById('tab-active-count'),
  tabTransitCount: document.getElementById('tab-transit-count'),
  tabUnassignedCount: document.getElementById('tab-unassigned-count'),
  ordersList: document.getElementById('orders-list'),
  driversList: document.getElementById('drivers-list'),
  incidentsList: document.getElementById('incidents-list'),
  incidentsCount: document.getElementById('incidents-count'),
  navIncidentsCount: document.getElementById('nav-incidents-count'),
  assignmentScore: document.getElementById('assignment-score'),
  assignmentProgress: document.getElementById('assignment-progress'),
  assignmentChecks: document.getElementById('assignment-checks'),
  detailOrderId: document.getElementById('detail-order-id'),
  detailOrderState: document.getElementById('detail-order-state'),
  detailOrderBody: document.getElementById('detail-order-body'),
  detailDriverName: document.getElementById('detail-driver-name'),
  detailDriverState: document.getElementById('detail-driver-state'),
  detailClientName: document.getElementById('detail-client-name'),
  detailClientAddress: document.getElementById('detail-client-address'),
  detailTrackingLink: document.getElementById('detail-tracking-link'),
  detailEta: document.getElementById('detail-eta'),
  driverCallLink: document.getElementById('driver-call-link'),
  mapFocusCard: document.getElementById('map-focus-card'),
  zoneNorthCount: document.getElementById('zone-north-count'),
  zoneCenterCount: document.getElementById('zone-center-count'),
  zoneEastCount: document.getElementById('zone-east-count'),
  zoneSouthCount: document.getElementById('zone-south-count')
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

let currentSnapshot = null;
let selectedOrderId = null;

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
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

function stateLabel(state) {
  const normalized = String(state || '').toUpperCase();
  const labels = {
    CREADO: 'Creado',
    PENDIENTE: 'Pendiente',
    ASIGNADO: 'Asignado',
    LISTO: 'Listo',
    EN_TRANSITO: 'En camino',
    ENTREGADO: 'Entregado',
    CANCELADO: 'Cancelado'
  };
  return labels[normalized] || normalized || 'Pendiente';
}

async function fetchOperationalDashboard() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sesion no activa');
  }

  const token = await user.getIdToken();
  const startedAt = performance.now();
  const response = await fetch(`${API_ORIGIN}/api/admin/dashboard/operativo`, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json().catch(() => ({}));
  const latency = Math.max(1, Math.round(performance.now() - startedAt));

  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  return { payload, latency };
}

function renderEmptyOrders() {
  ui.ordersList.innerHTML = `
    <div class="ops-order-card">
      <h3>Sin pedidos activos</h3>
      <p>La operacion esta lista para recibir nuevos pedidos.</p>
    </div>
  `;
}

function renderOrders(orders = []) {
  if (!orders.length) {
    renderEmptyOrders();
    renderOrderDetail(null);
    return;
  }

  if (!selectedOrderId || !orders.some((order) => order.id === selectedOrderId)) {
    selectedOrderId = orders[0].id;
  }

  ui.ordersList.innerHTML = orders.map((order) => `
    <article class="ops-order-card ${order.id === selectedOrderId ? 'active' : ''}" data-order-id="${escapeHtml(order.id)}">
      <div class="ops-order-top">
        <div>
          <h3>#${escapeHtml(order.short_id || order.id)}</h3>
          <p>${escapeHtml(order.title)} / ${escapeHtml(order.commerce)}</p>
        </div>
        <strong>${money(order.amount)}</strong>
      </div>
      <div class="ops-order-meta">
        <span>${escapeHtml(order.customer)}</span>
        <span>${stateLabel(order.state)}</span>
        <span>${Number(order.minutes || 0)} min</span>
      </div>
    </article>
  `).join('');

  ui.ordersList.querySelectorAll('[data-order-id]').forEach((button) => {
    button.addEventListener('click', () => {
      selectedOrderId = button.getAttribute('data-order-id');
      renderSnapshot(currentSnapshot);
    });
  });

  renderOrderDetail(orders.find((order) => order.id === selectedOrderId) || orders[0]);
}

function renderOrderDetail(order) {
  if (!order) {
    ui.detailOrderId.textContent = 'Sin pedido seleccionado';
    ui.detailOrderState.textContent = 'Pendiente';
    ui.detailOrderBody.innerHTML = '<p class="ops-muted">Cuando exista un pedido activo, aqui se vera su timeline operativo.</p>';
    ui.detailDriverName.textContent = 'Sin asignar';
    ui.detailDriverState.textContent = 'Disponible';
    ui.detailClientName.textContent = 'Pendiente';
    ui.detailClientAddress.textContent = 'Sin direccion seleccionada.';
    ui.detailEta.textContent = 'Pendiente';
    ui.mapFocusCard.innerHTML = '<strong>Operacion lista</strong><span>Sin pedidos activos.</span><progress value="100" max="100"></progress>';
    return;
  }

  const label = stateLabel(order.state);
  ui.detailOrderId.textContent = `#${order.short_id || order.id}`;
  ui.detailOrderState.textContent = label;
  ui.detailClientName.textContent = order.customer || 'Cliente pendiente';
  ui.detailClientAddress.textContent = order.address || 'Direccion pendiente en pedido.';
  ui.detailDriverName.textContent = order.driver || 'Sin asignar';
  ui.detailDriverState.textContent = order.driver && order.driver !== 'Sin repartidor' ? 'En linea' : 'Por asignar';
  ui.detailEta.textContent = order.minutes > 0 ? `${Math.max(8, 25 - Number(order.minutes || 0))} min` : '12 min';
  ui.detailTrackingLink.href = `/tracking?pedido=${encodeURIComponent(order.id)}`;
  ui.mapFocusCard.innerHTML = `
    <strong>${escapeHtml(order.driver || order.customer || 'Pedido activo')}</strong>
    <span>${escapeHtml(label)} / ${escapeHtml(order.title || 'Operacion')}</span>
    <progress value="70" max="100"></progress>
  `;
  ui.detailOrderBody.innerHTML = `
    <div class="ops-timeline-row"><span>Pedido creado</span><strong>OK</strong></div>
    <div class="ops-timeline-row"><span>Confirmado por tienda</span><strong>${['LISTO', 'ASIGNADO', 'EN_TRANSITO', 'ENTREGADO'].includes(order.state) ? 'OK' : 'Pendiente'}</strong></div>
    <div class="ops-timeline-row"><span>Repartidor asignado</span><strong>${order.driver && order.driver !== 'Sin repartidor' ? 'OK' : 'Pendiente'}</strong></div>
    <div class="ops-timeline-row"><span>En camino al cliente</span><strong>${['EN_TRANSITO', 'ENTREGADO'].includes(order.state) ? 'OK' : 'Pendiente'}</strong></div>
    <div class="ops-timeline-row"><span>Entregado</span><strong>${order.state === 'ENTREGADO' ? 'OK' : 'Pendiente'}</strong></div>
  `;
}

function renderDrivers(drivers = []) {
  if (!drivers.length) {
    ui.driversList.innerHTML = '<p class="ops-muted">Sin repartidores en linea en esta lectura.</p>';
    return;
  }

  ui.driversList.innerHTML = drivers.map((driver) => `
    <article class="ops-driver-row">
      <div>
        <span class="ops-avatar">${escapeHtml(String(driver.name || 'R').slice(0, 1).toUpperCase())}</span>
        <div>
          <strong>${escapeHtml(driver.name)}</strong>
          <p>${escapeHtml(driver.zone)}</p>
        </div>
      </div>
      <div>
        <strong>${escapeHtml(driver.state)}</strong>
        <p>${Number(driver.load || 0)}%</p>
      </div>
    </article>
  `).join('');
}

function renderIncidents(incidents = []) {
  const activeIncidents = incidents.filter((incident) => incident.level !== 'success');
  ui.incidentsCount.textContent = String(activeIncidents.length);
  ui.navIncidentsCount.textContent = String(activeIncidents.length);
  ui.incidentsCount.className = `ops-status ${activeIncidents.length ? 'danger' : 'success'}`;

  ui.incidentsList.innerHTML = incidents.map((incident) => `
    <article class="ops-incident-row">
      <div>
        <span class="ops-avatar">${incident.level === 'success' ? 'OK' : '!'}</span>
        <div>
          <strong>${escapeHtml(incident.title)}</strong>
          <p>${escapeHtml(incident.body)}</p>
        </div>
      </div>
      <span class="ops-status ${incident.level === 'critical' ? 'danger' : incident.level === 'warning' ? 'warning' : 'success'}">
        ${incident.level === 'success' ? 'Normal' : 'Revisar'}
      </span>
    </article>
  `).join('');
}

function renderAssignment(assignment = {}) {
  const score = Number(assignment.score ?? 0);
  ui.assignmentScore.textContent = `${score}%`;
  ui.assignmentProgress.style.width = `${Math.max(0, Math.min(100, score))}%`;
  ui.assignmentChecks.innerHTML = (assignment.checks || []).map((check) => `<li>${escapeHtml(check)}</li>`).join('');
}

function renderZones(zones = []) {
  const byName = new Map(zones.map((zone) => [String(zone.name || '').toLowerCase(), zone]));
  ui.zoneNorthCount.textContent = `${byName.get('zona norte')?.orders ?? 0} pedidos`;
  ui.zoneCenterCount.textContent = `${byName.get('zona centro')?.orders ?? 0} pedidos`;
  ui.zoneEastCount.textContent = `${byName.get('zona oriente')?.orders ?? 0} pedidos`;
  ui.zoneSouthCount.textContent = `${byName.get('zona sur')?.orders ?? 0} pedidos`;
}

function renderSnapshot(snapshot, latency = null) {
  if (!snapshot) return;
  currentSnapshot = snapshot;

  const view = snapshot.operational_view || {};
  const center = view.command_center || {};
  const overview = snapshot.overview || {};
  const activeOrders = Number(center.active_orders ?? overview.pedidos_activos ?? 0);
  const totalDrivers = Number(center.total_drivers ?? center.active_drivers ?? overview.repartidores ?? 0);
  const activeDrivers = Number(center.active_drivers ?? overview.repartidores ?? 0);
  const grossSales = Number(center.gross_sales ?? overview.ventas_brutas ?? 0);
  const commission = Number(center.nelly_commission ?? overview.comisiones_nelly ?? 0);

  ui.dashboardStatus.textContent = snapshot.ok ? 'Tiempo real' : 'Con alertas';
  ui.controlStatus.textContent = snapshot.ok ? 'Operando normalmente' : 'Revisar alertas';
  if (latency != null) {
    ui.latency.textContent = `Latencia: ${latency} ms`;
  }
  ui.overviewPedidosActivos.textContent = String(activeOrders);
  ui.overviewRepartidores.textContent = String(activeDrivers);
  ui.overviewRepartidoresTotal.textContent = String(totalDrivers);
  ui.overviewTiempoEntrega.textContent = String(center.average_delivery_minutes ?? snapshot.operational_metrics?.avgEntregaMinutos ?? 0);
  ui.overviewZonas.textContent = `${center.active_zones ?? 4} / 5`;
  ui.overviewZonasLabel.textContent = 'Centro, Norte, Sur, Oriente';
  ui.overviewSatisfaccion.textContent = String(center.satisfaction ?? 4.9);
  ui.overviewVentasBrutas.textContent = money(grossSales);
  ui.overviewComisiones.textContent = money(commission);
  ui.overviewFinance.textContent = `Ventas: ${money(grossSales)} / Comisiones: ${money(commission)}`;
  ui.kpiOrdersDelta.textContent = activeOrders > 0 ? 'Operacion en curso' : 'Listo para recibir pedidos';
  ui.kpiDriversDelta.textContent = totalDrivers > 0 ? `${Math.round((activeDrivers / totalDrivers) * 100)}% conectado` : 'Sin flota activa';
  ui.tabActiveCount.textContent = String(activeOrders);
  ui.tabTransitCount.textContent = String(center.in_transit ?? 0);
  ui.tabUnassignedCount.textContent = String(center.unassigned ?? 0);

  renderOrders(view.orders || []);
  renderDrivers(view.drivers || []);
  renderIncidents(view.incidents || []);
  renderAssignment(view.assignment || {});
  renderZones(view.zones || []);
}

async function refreshDashboard() {
  ui.btnRefresh.disabled = true;
  ui.dashboardStatus.textContent = 'Sincronizando...';

  try {
    const { payload, latency } = await fetchOperationalDashboard();
    renderSnapshot(payload, latency);
  } catch (error) {
    ui.dashboardStatus.textContent = 'Sin datos';
    ui.controlStatus.textContent = 'No se pudo cargar';
    ui.latency.textContent = error.message;
    ui.ordersList.innerHTML = `
      <div class="ops-order-card">
        <h3>No fue posible cargar el snapshot</h3>
        <p>${escapeHtml(error.message)}</p>
      </div>
    `;
  } finally {
    ui.btnRefresh.disabled = false;
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
