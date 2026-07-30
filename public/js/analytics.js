import { auth } from './admin-firebase-config.js';

const API_ORIGIN = (() => {
  const host = String(window.location?.hostname || '').toLowerCase();
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') return window.location.origin;
  return 'https://nelly-api-8lh1.onrender.com';
})();

const DATA_ACCESS_ENDPOINT = `${API_ORIGIN}/api/data-architecture/data-access`;

const ui = {
  totalOrders: document.getElementById('analytics-total-orders'),
  totalSales: document.getElementById('analytics-total-sales'),
  averageTicket: document.getElementById('analytics-average-ticket'),
  deliveredOrders: document.getElementById('analytics-delivered-orders'),
  commerceCount: document.getElementById('analytics-commerce-count'),
  customerCount: document.getElementById('analytics-customer-count'),
  driverCount: document.getElementById('analytics-driver-count'),
  incidentCount: document.getElementById('analytics-incident-count'),
  operativoList: document.getElementById('analytics-operativo-list'),
  comercialList: document.getElementById('analytics-comercial-list'),
  monthlyList: document.getElementById('analytics-monthly-list'),
  annualList: document.getElementById('analytics-annual-list'),
  businessList: document.getElementById('analytics-business-list')
};

let archiveEngineAnalyticsMeta = {
  source: 'fallback',
  contract_version: null,
  module: 'analytics',
  generatedAt: null,
  error: null
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function setArchiveMeta(meta = {}) {
  archiveEngineAnalyticsMeta = {
    source: meta.source || 'fallback',
    contract_version: meta.contract_version || null,
    module: 'analytics',
    generatedAt: meta.generatedAt || null,
    error: meta.error || null
  };
  window.__nellyArchiveEngineMeta = archiveEngineAnalyticsMeta;
}

function renderRow(label, value, meta = '') {
  return `<div class="wc-row"><span><strong>${escapeHtml(label)}</strong></span><strong>${escapeHtml(value)}</strong>${meta ? `<small class="wc-muted">${escapeHtml(meta)}</small>` : ''}</div>`;
}

function getOrderTimestamp(order = {}) {
  return Number(order.timestampActualizacion || order.finalizado_at || order.entregado_en || order.createdAt || order.created_at || order.fecha_creacion || order.fecha || order.timestamp || Date.now());
}

function getOrderState(order = {}) {
  return String(order?.estado_pedido || order?.estado || order?.logistica?.estado || '').trim().toLowerCase();
}

function renderAnalytics(payload = {}) {
  const historicalOrders = Array.isArray(payload.historical_orders) ? payload.historical_orders : [];
  const monthly = Array.isArray(payload.monthly_summary) ? payload.monthly_summary : [];
  const annual = Array.isArray(payload.annual_summary) ? payload.annual_summary : [];
  const historyIndex = payload?.audit_index?.history_index || {};

  const totalOrders = historicalOrders.length;
  const deliveredOrders = historicalOrders.filter((order) => ['entregado', 'finalizado'].includes(getOrderState(order))).length;
  const totalSales = historicalOrders.reduce((sum, order) => sum + Number(order.monto_total || order.total || order.monto || 0), 0);
  const averageTicket = totalOrders ? totalSales / totalOrders : 0;

  if (ui.totalOrders) ui.totalOrders.textContent = String(totalOrders);
  if (ui.totalSales) ui.totalSales.textContent = money(totalSales);
  if (ui.averageTicket) ui.averageTicket.textContent = money(averageTicket);
  if (ui.deliveredOrders) ui.deliveredOrders.textContent = String(deliveredOrders);

  const commerceEntries = Object.entries(historyIndex.comercio || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const customerEntries = Object.entries(historyIndex.cliente || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const driverEntries = Object.entries(historyIndex.driver || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const incidentEntries = Object.entries(historyIndex.incidencia || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);
  const paymentEntries = Object.entries(historyIndex.forma_pago || {}).sort((a, b) => b[1] - a[1]).slice(0, 5);

  if (ui.commerceCount) ui.commerceCount.textContent = String(Object.keys(historyIndex.comercio || {}).length);
  if (ui.customerCount) ui.customerCount.textContent = String(Object.keys(historyIndex.cliente || {}).length);
  if (ui.driverCount) ui.driverCount.textContent = String(Object.keys(historyIndex.driver || {}).length);
  if (ui.incidentCount) ui.incidentCount.textContent = String(Object.keys(historyIndex.incidencia || {}).length);

  if (ui.operativoList) {
    const recentOrders = [...historicalOrders]
      .sort((a, b) => getOrderTimestamp(b) - getOrderTimestamp(a))
      .slice(0, 5);
    ui.operativoList.innerHTML = recentOrders.length
      ? recentOrders.map((order) => {
          const label = order.shortId || order.id_pedido || order.id || 'Pedido';
          const timestamp = new Date(getOrderTimestamp(order)).toLocaleString('es-MX', {
            day: '2-digit',
            month: 'short',
            hour: '2-digit',
            minute: '2-digit'
          });
          return renderRow(`#${label}`, getOrderState(order).toUpperCase() || 'SIN ESTADO', timestamp);
        }).join('')
      : '<div class="wc-empty">Sin pedidos historicos disponibles.</div>';
  }

  if (ui.comercialList) {
    ui.comercialList.innerHTML = [
      renderRow('Ventas historicas', money(totalSales), 'NAE'),
      renderRow('Ticket promedio', money(averageTicket), 'NAE'),
      renderRow('Pedidos entregados', String(deliveredOrders), 'NAE')
    ].join('');
  }

  if (ui.monthlyList) {
    ui.monthlyList.innerHTML = monthly.length
      ? monthly.slice(0, 8).map((item) => renderRow(
          String(item.period || 'Periodo'),
          `${String(item.pedidos || 0)} pedidos · ${String(item.entregados || 0)} entregados`,
          money(item.monto_total || 0)
        )).join('')
      : '<div class="wc-empty">Sin tendencias mensuales.</div>';
  }

  if (ui.annualList) {
    ui.annualList.innerHTML = annual.length
      ? annual.slice(0, 8).map((item) => renderRow(
          String(item.year || 'Año'),
          `${String(item.pedidos || 0)} pedidos · ${String(item.entregados || 0)} entregados`,
          money(item.monto_total || 0)
        )).join('')
      : '<div class="wc-empty">Sin comparativo anual.</div>';
  }

  if (ui.businessList) {
    ui.businessList.innerHTML = [
      renderRow('Comercios activos', String((historyIndex.comercio && Object.keys(historyIndex.comercio).length) || 0), 'history_index'),
      renderRow('Clientes frecuentes', String((historyIndex.cliente && Object.keys(historyIndex.cliente).length) || 0), 'history_index'),
      renderRow('Repartidores observados', String((historyIndex.driver && Object.keys(historyIndex.driver).length) || 0), 'history_index'),
      renderRow('Metodos de pago', String((historyIndex.forma_pago && Object.keys(historyIndex.forma_pago).length) || 0), 'history_index'),
      renderRow('Incidencias', String((historyIndex.incidencia && Object.keys(historyIndex.incidencia).length) || 0), 'history_index')
    ].join('');
  }

  setArchiveMeta({
    source: 'archive-engine',
    contract_version: payload.contract_version || 'v1',
    generatedAt: payload.generatedAt || null
  });
}

async function loadAnalytics() {
  const user = auth.currentUser;
  if (!user) throw new Error('Sesion no activa');

  const token = await user.getIdToken();
  const response = await fetch(DATA_ACCESS_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  renderAnalytics(payload);
}

window.addEventListener('nelly:work-center-authenticated', () => {
  loadAnalytics().catch((error) => {
    if (ui.operativoList) ui.operativoList.innerHTML = `<div class="wc-empty">No se pudo cargar Analytics: ${escapeHtml(error.message)}</div>`;
    if (ui.comercialList) ui.comercialList.innerHTML = `<div class="wc-empty">No se pudo cargar Analytics: ${escapeHtml(error.message)}</div>`;
    if (ui.monthlyList) ui.monthlyList.innerHTML = `<div class="wc-empty">No se pudieron cargar tendencias.</div>`;
    if (ui.annualList) ui.annualList.innerHTML = `<div class="wc-empty">No se pudo cargar comparativo anual.</div>`;
    if (ui.businessList) ui.businessList.innerHTML = `<div class="wc-empty">No se pudieron cargar señales historicas.</div>`;
    setArchiveMeta({
      source: 'fallback',
      error: error.message
    });
  });
});
