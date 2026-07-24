import { auth } from './admin-firebase-config.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js';

const ui = {
  loginSection: document.getElementById('login-section'),
  crmSection: document.getElementById('crm-section'),
  loginForm: document.getElementById('login-form'),
  loginEmail: document.getElementById('login-email'),
  loginPassword: document.getElementById('login-password'),
  loginError: document.getElementById('login-error'),
  btnRefresh: document.getElementById('btn-refresh'),
  crmStatus: document.getElementById('crm-status'),
  overviewClientesTotales: document.getElementById('overview-clientes-totales'),
  overviewClientesRecurrentes: document.getElementById('overview-clientes-recurrentes'),
  overviewComerciosTotales: document.getElementById('overview-comercios-totales'),
  customerSelect: document.getElementById('customer-select'),
  commerceSelect: document.getElementById('commerce-select'),
  customerSummary: document.getElementById('customer-summary'),
  customerDetail: document.getElementById('customer-detail'),
  customerList: document.getElementById('customer-list'),
  commerceSummary: document.getElementById('commerce-summary'),
  commerceDetail: document.getElementById('commerce-detail'),
  commerceList: document.getElementById('commerce-list')
};

const AUTHORIZED_ADMIN_EMAILS = new Set([
  'admin@nellydelivery.com',
  'operaciones@nellydelivery.com'
]);

const state = {
  snapshot: null,
  customers: [],
  commerces: []
};

function money(value) {
  return `$${Number(value || 0).toFixed(2)}`;
}

function dateText(value) {
  if (!value) return 'Sin dato';
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) return 'Sin dato';
  return new Intl.DateTimeFormat('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(numeric));
}

function joinList(items, fallback = 'Sin datos') {
  return Array.isArray(items) && items.length > 0 ? items.join(' · ') : fallback;
}

function showLogin() {
  ui.crmSection.classList.add('hidden');
  ui.loginSection.classList.remove('hidden');
}

function showCRM() {
  ui.loginSection.classList.add('hidden');
  ui.crmSection.classList.remove('hidden');
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

async function fetchCRM() {
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
  return payload?.projections?.crm || {};
}

function renderCustomerDetail(customer) {
  if (!customer) {
    return 'Selecciona un cliente para ver su ficha completa.';
  }

  return `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${customer.nombre}</span>
        <span class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${customer.ultima_condicion || 'Sin estado'}</span>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <p><span class="text-slate-400">Telefono:</span> ${customer.telefono || 'Sin telefono'}</p>
        <p><span class="text-slate-400">Primer pedido:</span> ${dateText(customer.primer_pedido_at)}</p>
        <p><span class="text-slate-400">Ultimo pedido:</span> ${dateText(customer.ultimo_pedido_at)}</p>
        <p><span class="text-slate-400">Pedidos totales:</span> ${customer.pedidos_totales ?? 0}</p>
        <p><span class="text-slate-400">Pedidos entregados:</span> ${customer.pedidos_entregados ?? 0}</p>
        <p><span class="text-slate-400">Cancelados:</span> ${customer.pedidos_cancelados ?? 0}</p>
        <p><span class="text-slate-400">Total gastado:</span> ${money(customer.total_gastado ?? 0)}</p>
        <p><span class="text-slate-400">Ticket promedio:</span> ${money(customer.ticket_promedio ?? 0)}</p>
        <p><span class="text-slate-400">Frecuencia:</span> ${Number(customer.frecuencia_compra ?? 0).toFixed(2)}</p>
      </div>
      <div>
        <p class="text-slate-400">Productos favoritos</p>
        <p>${joinList((customer.productos_favoritos || []).map((item) => `${item.nombre} (${item.cantidad})`))}</p>
      </div>
      <div>
        <p class="text-slate-400">Comercios favoritos</p>
        <p>${joinList((customer.comercios_favoritos || []).map((item) => `${item.nombre} (${item.pedidos})`))}</p>
      </div>
      <div>
        <p class="text-slate-400">Horarios frecuentes</p>
        <p>${joinList((customer.horarios_frecuentes || []).map((item) => `${item.hora}h (${item.pedidos})`))}</p>
      </div>
    </div>
  `;
}

function renderCommerceDetail(commerce) {
  if (!commerce) {
    return 'Selecciona un comercio para ver su ficha completa.';
  }

  return `
    <div class="space-y-3">
      <div class="flex flex-wrap items-center gap-2">
        <span class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${commerce.nombre}</span>
        <span class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">${commerce.activo ? 'Activo' : 'Inactivo'}</span>
      </div>
      <div class="grid gap-3 md:grid-cols-2">
        <p><span class="text-slate-400">Categoria:</span> ${commerce.categoria || 'Sin clasificacion'}</p>
        <p><span class="text-slate-400">Ciudad:</span> ${commerce.ciudad || 'Sin ciudad'}</p>
        <p><span class="text-slate-400">Pedidos aprox.:</span> ${commerce.pedidos_aproximados ?? 0}</p>
        <p><span class="text-slate-400">Productos totales:</span> ${commerce.productos_totales ?? 0}</p>
        <p><span class="text-slate-400">Disponibles:</span> ${commerce.productos_disponibles ?? 0}</p>
        <p><span class="text-slate-400">Ultimo estado:</span> ${commerce.ultima_condicion || 'Sin dato'}</p>
      </div>
      <div>
        <p class="text-slate-400">Productos populares</p>
        <p>${joinList(commerce.productos_populares || [])}</p>
      </div>
    </div>
  `;
}

function renderCustomerCard(customer) {
  const topItems = Array.isArray(customer?.productos_favoritos) ? customer.productos_favoritos : [];
  const commerces = Array.isArray(customer?.comercios_favoritos) ? customer.comercios_favoritos : [];
  const hours = Array.isArray(customer?.horarios_frecuentes) ? customer.horarios_frecuentes : [];

  return `
    <article class="rounded-xl border border-crm-line bg-slate-950/40 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 class="text-lg font-semibold text-crm-accent">${customer?.nombre || 'Cliente sin nombre'}</h4>
          <p class="text-sm text-slate-300">${customer?.telefono || 'Sin telefono'}</p>
        </div>
        <div class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">
          ${customer?.ultima_condicion || 'Sin estado'}
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <div><p class="text-xs text-slate-400">Pedidos</p><p class="font-semibold">${customer?.pedidos_totales ?? 0}</p></div>
        <div><p class="text-xs text-slate-400">Entregados</p><p class="font-semibold">${customer?.pedidos_entregados ?? 0}</p></div>
        <div><p class="text-xs text-slate-400">Cancelados</p><p class="font-semibold">${customer?.pedidos_cancelados ?? 0}</p></div>
        <div><p class="text-xs text-slate-400">Total gastado</p><p class="font-semibold">${money(customer?.total_gastado ?? 0)}</p></div>
        <div><p class="text-xs text-slate-400">Ticket promedio</p><p class="font-semibold">${money(customer?.ticket_promedio ?? 0)}</p></div>
        <div><p class="text-xs text-slate-400">Frecuencia</p><p class="font-semibold">${Number(customer?.frecuencia_compra ?? 0).toFixed(2)}</p></div>
      </div>
      <div class="mt-4 grid gap-3 text-sm md:grid-cols-3">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Primer pedido</p>
          <p class="mt-1 text-slate-200">${dateText(customer?.primer_pedido_at)}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Ultimo pedido</p>
          <p class="mt-1 text-slate-200">${dateText(customer?.ultimo_pedido_at)}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Preferencias</p>
          <p class="mt-1 text-slate-200">${joinList(topItems.map((item) => `${item.nombre} (${item.cantidad})`))}</p>
        </div>
      </div>
      <div class="mt-4 grid gap-3 text-sm md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Comercios favoritos</p>
          <p class="mt-1 text-slate-200">${joinList(commerces.map((item) => `${item.nombre} (${item.pedidos})`))}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-wide text-slate-400">Horarios frecuentes</p>
          <p class="mt-1 text-slate-200">${joinList(hours.map((item) => `${item.hora}h (${item.pedidos})`))}</p>
        </div>
      </div>
    </article>
  `;
}

function renderCommerceCard(commerce) {
  const products = Array.isArray(commerce?.productos_populares) ? commerce.productos_populares : [];
  return `
    <article class="rounded-xl border border-crm-line bg-slate-950/40 p-4">
      <div class="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h4 class="text-lg font-semibold text-crm-info">${commerce?.nombre || 'Comercio sin nombre'}</h4>
          <p class="text-sm text-slate-300">${[commerce?.categoria, commerce?.ciudad].filter(Boolean).join(' · ') || 'Sin clasificacion'}</p>
        </div>
        <div class="rounded-full border border-crm-line bg-slate-900/60 px-3 py-1 text-xs text-slate-200">
          ${commerce?.activo ? 'Activo' : 'Inactivo'}
        </div>
      </div>
      <div class="mt-4 grid grid-cols-2 gap-3 text-sm md:grid-cols-3">
        <div><p class="text-xs text-slate-400">Pedidos aprox.</p><p class="font-semibold">${commerce?.pedidos_aproximados ?? 0}</p></div>
        <div><p class="text-xs text-slate-400">Productos</p><p class="font-semibold">${commerce?.productos_totales ?? 0}</p></div>
        <div><p class="text-xs text-slate-400">Disponibles</p><p class="font-semibold">${commerce?.productos_disponibles ?? 0}</p></div>
      </div>
      <div class="mt-4 text-sm">
        <p class="text-xs uppercase tracking-wide text-slate-400">Productos populares</p>
        <p class="mt-1 text-slate-200">${joinList(products)}</p>
      </div>
    </article>
  `;
}

function syncSelectors() {
  const customers = state.customers;
  const commerces = state.commerces;

  ui.customerSelect.innerHTML = customers.length > 0
    ? [
        '<option value="">Selecciona un cliente</option>',
        ...customers.map((customer) => `<option value="${customer.nombre}">${customer.nombre}</option>`)
      ].join('')
    : '<option value="">Sin clientes</option>';

  ui.commerceSelect.innerHTML = commerces.length > 0
    ? [
        '<option value="">Selecciona un comercio</option>',
        ...commerces.map((commerce) => `<option value="${commerce.nombre}">${commerce.nombre}</option>`)
      ].join('')
    : '<option value="">Sin comercios</option>';
}

function updateDetails() {
  const selectedCustomer = state.customers.find((customer) => customer.nombre === ui.customerSelect.value) || state.customers[0] || null;
  const selectedCommerce = state.commerces.find((commerce) => commerce.nombre === ui.commerceSelect.value) || state.commerces[0] || null;
  ui.customerDetail.innerHTML = renderCustomerDetail(selectedCustomer);
  ui.commerceDetail.innerHTML = renderCommerceDetail(selectedCommerce);
}

function renderCRM(snapshot) {
  const summary = snapshot?.summary || {};
  state.customers = Array.isArray(snapshot?.customers) ? snapshot.customers : [];
  state.commerces = Array.isArray(snapshot?.commerces) ? snapshot.commerces : [];

  ui.crmStatus.textContent = 'SSOT VALIDADA';
  ui.crmStatus.className = 'mt-1 text-2xl font-bold text-crm-accent';

  ui.overviewClientesTotales.textContent = String(summary.clientes_totales ?? 0);
  ui.overviewClientesRecurrentes.textContent = String(summary.clientes_recurrentes ?? 0);
  ui.overviewComerciosTotales.textContent = String(summary.comercios_totales ?? 0);

  ui.customerSummary.textContent = `${state.customers.length} fichas`;
  ui.commerceSummary.textContent = `${state.commerces.length} comercios`;

  syncSelectors();
  updateDetails();

  ui.customerList.innerHTML = state.customers.length > 0
    ? state.customers.map(renderCustomerCard).join('')
    : '<p class="rounded-xl border border-crm-line bg-slate-950/40 p-4 text-sm text-slate-300">Sin clientes suficientes para mostrar ficha CRM.</p>';
  ui.commerceList.innerHTML = state.commerces.length > 0
    ? state.commerces.map(renderCommerceCard).join('')
    : '<p class="rounded-xl border border-crm-line bg-slate-950/40 p-4 text-sm text-slate-300">Sin comercios suficientes para mostrar ficha CRM.</p>';
}

async function refreshCRM() {
  try {
    const snapshot = await fetchCRM();
    state.snapshot = snapshot;
    renderCRM(snapshot);
  } catch (error) {
    ui.crmStatus.textContent = 'ERROR';
    ui.crmStatus.className = 'mt-1 text-2xl font-bold text-red-300';
    ui.customerSummary.textContent = error.message;
    ui.commerceSummary.textContent = 'Sin datos';
  }
}

ui.loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  setLoginError('');

  const email = String(ui.loginEmail.value || '').trim().toLowerCase();
  const password = String(ui.loginPassword.value || '');

  if (!AUTHORIZED_ADMIN_EMAILS.has(email)) {
    setLoginError('Correo no autorizado para el CRM basico.');
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setLoginError(`No fue posible iniciar sesion: ${error.message}`);
  }
});

ui.btnRefresh.addEventListener('click', refreshCRM);
ui.customerSelect.addEventListener('change', updateDetails);
ui.commerceSelect.addEventListener('change', updateDetails);

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

  showCRM();
  await refreshCRM();
});
