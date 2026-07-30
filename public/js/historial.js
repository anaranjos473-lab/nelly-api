import { auth } from './admin-firebase-config.js';

const API_ORIGIN = (() => {
  const host = String(window.location?.hostname || '').toLowerCase();
  if (host === '127.0.0.1' || host === 'localhost' || host === '::1') {
    return window.location.origin;
  }
  return 'https://nelly-api-8lh1.onrender.com';
})();

const DATA_ACCESS_ENDPOINT = `${API_ORIGIN}/api/data-architecture/data-access`;

const ui = {
  yearCount: document.getElementById('history-year-count'),
  monthCount: document.getElementById('history-month-count'),
  dayCount: document.getElementById('history-day-count'),
  orderCount: document.getElementById('history-order-count'),
  yearSelect: document.getElementById('history-year-select'),
  monthSelect: document.getElementById('history-month-select'),
  daySelect: document.getElementById('history-day-select'),
  refresh: document.getElementById('history-refresh'),
  tree: document.getElementById('history-tree'),
  filterList: document.getElementById('history-filter-list'),
  monthlySummary: document.getElementById('history-monthly-summary'),
  annualSummary: document.getElementById('history-annual-summary'),
  detailTitle: document.getElementById('history-detail-title'),
  detailSummary: document.getElementById('history-detail-summary'),
  detailList: document.getElementById('history-detail-list')
};

let historyOrders = [];
let historyIndex = null;
let filteredOrders = [];

function formatMoney(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function getOrderDateParts(order) {
  const timestamp = Number(order?.timestampActualizacion || order?.finalizado_at || order?.entregado_en || order?.createdAt || order?.created_at || order?.fecha_creacion || order?.fecha || order?.timestamp || Date.now());
  const date = new Date(timestamp);
  return {
    year: String(date.getFullYear()),
    month: String(date.getMonth() + 1).padStart(2, '0'),
    day: String(date.getDate()).padStart(2, '0')
  };
}

function getOrderLabel(order) {
  return String(order?.shortId || order?.id_pedido || order?.pedido_id || order?.id || 'Pedido').trim();
}

function getHistoryValue(value, fallback = 'Sin dato') {
  return String(value || '').trim() || fallback;
}

function renderListItem(title, subtitle, meta = '') {
  return `
    <div class="wc-row">
      <div>
        <strong>${title}</strong>
        <div class="wc-muted">${subtitle}</div>
      </div>
      <span class="wc-pill blue">${meta}</span>
    </div>
  `;
}

function buildHistoryTree(orders) {
  const tree = new Map();
  orders.forEach((order) => {
    const { year, month, day } = getOrderDateParts(order);
    if (!tree.has(year)) tree.set(year, new Map());
    const months = tree.get(year);
    if (!months.has(month)) months.set(month, new Map());
    const days = months.get(month);
    if (!days.has(day)) days.set(day, []);
    days.get(day).push(order);
  });
  return tree;
}

function renderSummary(orders) {
  const tree = buildHistoryTree(orders);
  const years = [...tree.keys()].sort((a, b) => b.localeCompare(a));
  const months = [...new Set(orders.map((order) => `${getOrderDateParts(order).year}-${getOrderDateParts(order).month}`))].sort((a, b) => b.localeCompare(a));
  const days = [...new Set(orders.map((order) => `${getOrderDateParts(order).year}-${getOrderDateParts(order).month}-${getOrderDateParts(order).day}`))].sort((a, b) => b.localeCompare(a));

  ui.yearCount.textContent = String(years.length);
  ui.monthCount.textContent = String(months.length);
  ui.dayCount.textContent = String(days.length);
  ui.orderCount.textContent = String(orders.length);

  ui.yearSelect.innerHTML = ['<option value="">Todos los años</option>', ...years.map((year) => `<option value="${year}">${year}</option>`)].join('');
  ui.monthSelect.innerHTML = ['<option value="">Todos los meses</option>'];
  ui.daySelect.innerHTML = ['<option value="">Todos los dias</option>'];

  const yearItems = years.slice(0, 8).map((year) => {
    const monthsMap = tree.get(year) || new Map();
    const monthCount = monthsMap.size;
    const dayCount = [...monthsMap.values()].reduce((acc, daysMap) => acc + daysMap.size, 0);
    const orderCount = [...monthsMap.values()].reduce((acc, daysMap) => acc + [...daysMap.values()].reduce((dayAcc, items) => dayAcc + items.length, 0), 0);
    return `<div class="wc-card"><h3>${year}</h3><p class="wc-muted">${monthCount} meses · ${dayCount} dias · ${orderCount} pedidos</p></div>`;
  }).join('');
  ui.tree.innerHTML = yearItems || '<div class="wc-card"><h3>Sin historial</h3><p class="wc-muted">No hay pedidos historicos para mostrar.</p></div>';
}

function applyFilters() {
  const year = String(ui.yearSelect.value || '').trim();
  const month = String(ui.monthSelect.value || '').trim();
  const day = String(ui.daySelect.value || '').trim();

  filteredOrders = historyOrders.filter((order) => {
    const parts = getOrderDateParts(order);
    if (year && parts.year !== year) return false;
    if (month && parts.month !== month) return false;
    if (day && parts.day !== day) return false;
    return true;
  });

  if (year) {
    const yearOrders = historyOrders.filter((order) => getOrderDateParts(order).year === year);
    const months = [...new Set(yearOrders.map((order) => getOrderDateParts(order).month))].sort((a, b) => b.localeCompare(a));
    ui.monthSelect.innerHTML = ['<option value="">Todos los meses</option>', ...months.map((m) => `<option value="${m}">${m}</option>`)].join('');
  } else {
    ui.monthSelect.innerHTML = '<option value="">Todos los meses</option>';
  }

  if (year && month) {
    const monthOrders = historyOrders.filter((order) => {
      const parts = getOrderDateParts(order);
      return parts.year === year && parts.month === month;
    });
    const days = [...new Set(monthOrders.map((order) => getOrderDateParts(order).day))].sort((a, b) => b.localeCompare(a));
    ui.daySelect.innerHTML = ['<option value="">Todos los dias</option>', ...days.map((d) => `<option value="${d}">${d}</option>`)].join('');
  } else {
    ui.daySelect.innerHTML = '<option value="">Todos los dias</option>';
  }

  renderDetailView();
}

function renderFilters() {
  const commerceIndex = historyIndex?.history_index?.comercio || {};
  const customerIndex = historyIndex?.history_index?.cliente || {};
  const driverIndex = historyIndex?.history_index?.driver || {};
  const paymentIndex = historyIndex?.history_index?.forma_pago || {};
  const incidentIndex = historyIndex?.history_index?.incidencia || {};

  ui.filterList.innerHTML = [
    ['Comercio', commerceIndex],
    ['Cliente', customerIndex],
    ['Repartidor', driverIndex],
    ['Pago', paymentIndex],
    ['Incidencia', incidentIndex]
  ].map(([label, entries]) => {
    const top = Object.entries(entries || {}).sort((a, b) => b[1] - a[1]).slice(0, 3);
    return `
      <article class="wc-card">
        <div class="wc-card-header">
          <div>
            <p class="wc-eyebrow">${label}</p>
            <h3>Top filtros</h3>
          </div>
        </div>
        <div class="wc-list">
          ${top.length ? top.map(([name, count]) => renderListItem(name, `${count} pedidos`, label)).join('') : renderListItem('Sin datos', 'No hay entradas para este índice', label)}
        </div>
      </article>
    `;
  }).join('');
}

function renderIndexSummaries() {
  const monthly = Array.isArray(historyIndex?.monthly_summary) ? historyIndex.monthly_summary : [];
  const annual = Array.isArray(historyIndex?.annual_summary) ? historyIndex.annual_summary : [];

  ui.monthlySummary.innerHTML = monthly.length
    ? monthly.map((item) => renderListItem(item.period || 'Periodo', `Pedidos: ${item.pedidos || 0} · Entregados: ${item.entregados || 0} · Cancelados: ${item.cancelados || 0}`, formatMoney(item.monto_total || 0))).join('')
    : renderListItem('Sin resumen mensual', 'El NAE aun no reporta periodos.', '');

  ui.annualSummary.innerHTML = annual.length
    ? annual.map((item) => renderListItem(String(item.year || 'Año'), `Pedidos: ${item.pedidos || 0} · Entregados: ${item.entregados || 0} · Cancelados: ${item.cancelados || 0}`, formatMoney(item.monto_total || 0))).join('')
    : renderListItem('Sin resumen anual', 'El NAE aun no reporta acumulado anual.', '');
}

function renderDetailView() {
  const year = String(ui.yearSelect.value || '').trim();
  const month = String(ui.monthSelect.value || '').trim();
  const day = String(ui.daySelect.value || '').trim();
  const filtered = historyOrders.filter((order) => {
    const parts = getOrderDateParts(order);
    if (year && parts.year !== year) return false;
    if (month && parts.month !== month) return false;
    if (day && parts.day !== day) return false;
    return true;
  });

  const selectedLabel = [year, month, day].filter(Boolean).join('-');
  ui.detailTitle.textContent = selectedLabel ? `Pedidos ${selectedLabel}` : 'Selecciona un dia';
  ui.detailSummary.textContent = `${filtered.length} pedidos historicos visibles con los filtros actuales.`;
  ui.detailList.innerHTML = filtered.length
    ? filtered.slice(0, 200).map((order) => {
      const parts = getOrderDateParts(order);
      const label = getOrderLabel(order);
      const commerce = getHistoryValue(order?.comercio?.nombre || order?.tienda?.nombre || order?.comercio_nombre || order?.tienda_nombre);
      const customer = getHistoryValue(order?.cliente_nombre || order?.cliente?.nombre || order?.cliente);
      const driver = getHistoryValue(order?.repartidor_nombre || order?.repartidor?.nombre || order?.repartidor_id || order?.driverUid);
      const state = getHistoryValue(order?.estado_pedido || order?.estado || order?.logistica?.estado);
      return `
        <article class="wc-card">
          <div class="wc-card-header">
            <div>
              <p class="wc-eyebrow">${parts.year}-${parts.month}-${parts.day}</p>
              <h3>#${label}</h3>
            </div>
            <span class="wc-pill blue">${state}</span>
          </div>
          <div class="wc-list">
            ${renderListItem('Comercio', commerce, 'NAE')}
            ${renderListItem('Cliente', customer, 'NAE')}
            ${renderListItem('Repartidor', driver, 'NAE')}
            ${renderListItem('Monto', formatMoney(order?.monto_total || order?.total || order?.monto), 'NAE')}
          </div>
        </article>
      `;
    }).join('')
    : '<div class="wc-card"><h3>Sin resultados</h3><p class="wc-muted">Ajusta el año, mes o dia para ver pedidos archivados.</p></div>';
}

async function loadHistory() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sesion no activa');
  }

  const token = await user.getIdToken();
  const response = await fetch(DATA_ACCESS_ENDPOINT, {
    headers: { Authorization: `Bearer ${token}` }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }

  historyOrders = Array.isArray(payload.historical_orders) ? payload.historical_orders : [];
  historyIndex = payload.audit_index || {};
  renderSummary(historyOrders);
  renderFilters();
  renderIndexSummaries();
  applyFilters();
  window.__nellyArchiveEngineMeta = {
    source: 'archive-engine',
    contract_version: payload.contract_version || 'v1',
    module: 'history',
    generatedAt: payload.generatedAt || null,
    error: null
  };
}

ui.refresh?.addEventListener('click', loadHistory);
ui.yearSelect?.addEventListener('change', applyFilters);
ui.monthSelect?.addEventListener('change', applyFilters);
ui.daySelect?.addEventListener('change', applyFilters);

window.addEventListener('nelly:work-center-authenticated', () => {
  loadHistory().catch((error) => {
    ui.detailSummary.textContent = `No se pudo cargar el historial: ${error.message}`;
    window.__nellyArchiveEngineMeta = {
      source: 'fallback',
      contract_version: null,
      module: 'history',
      generatedAt: null,
      error: error.message
    };
  });
});
