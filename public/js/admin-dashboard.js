// --- METRICAS DE RENTABILIDAD DIARIA ---
async function refreshRentabilidadMetrics() {
  try {
    const payload = await fetchAdminApi("/api/admin/metricas/rentabilidad");
    const ventas = Number(payload?.ventasBrutas || 0);
    const comisiones = Number(payload?.comisionesNelly || 0);
    const entregas = Number(payload?.conteoEntregas || 0);
    const mapa = payload?.mapaCalor || {};

    document.getElementById("metric-ventas-brutas").textContent = `$${ventas.toFixed(2)}`;
    document.getElementById("metric-comisiones-nelly").textContent = `$${comisiones.toFixed(2)}`;
    document.getElementById("metric-conteo-entregas").textContent = String(entregas);

    const mapaUl = document.getElementById("metric-mapa-calor");
    mapaUl.innerHTML = Object.entries(mapa).length
      ? Object.entries(mapa)
          .sort((a, b) => b[1] - a[1])
          .map(([zona, total]) => `<li class="flex justify-between border-b border-panel-line/40 pb-1"><span>${escapeHtml(zona)}</span><span class="font-bold">$${Number(total).toFixed(2)}</span></li>`)
          .join("")
      : '<li class="nelly-empty-state nelly-empty-state__body col-span-2">Sin entregas hoy</li>';
  } catch (error) {
    document.getElementById("metric-ventas-brutas").textContent = "$0.00";
    document.getElementById("metric-comisiones-nelly").textContent = "$0.00";
    document.getElementById("metric-conteo-entregas").textContent = "0";
    document.getElementById("metric-mapa-calor").innerHTML = '<li class="nelly-empty-state nelly-empty-state__body col-span-2">Mapa no disponible</li>';
  }
}
import { auth } from "./admin-firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "./local-auth.js";

const AUTHORIZED_ADMIN_EMAILS = new Set([
  "admin@nellydelivery.com",
  "operaciones@nellydelivery.com"
]);

// Permite cambiar el endpoint desde la consola para pruebas de nomina
window.setAdminApiEndpoint = function(url) {
  if (typeof url === 'string' && url.startsWith('http')) {
    window.__NELLY_ADMIN_API_ENDPOINT__ = url.replace(/\/+$/, '');
    console.log('[Nomina][Test] ADMIN_API_ENDPOINT cambiado a:', window.__NELLY_ADMIN_API_ENDPOINT__);
  } else {
    console.warn('URL invalida para ADMIN_API_ENDPOINT');
  }
};

const LOCAL_ADMIN_API_ENDPOINT = window.location?.origin || "http://127.0.0.1:3001";
const PROD_ADMIN_API_ENDPOINT = "https://nelly-api-8lh1.onrender.com";
const ADMIN_API_ENDPOINT = (() => {
  const configured = String(window.__NELLY_ADMIN_API_ENDPOINT__ || "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = String(window.location?.hostname || "").toLowerCase();
  if (host === "127.0.0.1" || host === "localhost" || host === "::1") {
    return LOCAL_ADMIN_API_ENDPOINT;
  }
  return PROD_ADMIN_API_ENDPOINT;
})();
const ADMIN_API_TIMEOUT_MS = 15000;
console.log("ADMIN DASHBOARD VERSION 522db1b");

// Script de validacion automatica de nomina
window.validarNomina = async function(uid, montoPago) {
  try {
    if (!uid || !montoPago) throw new Error('Falta uid o montoPago');
    const user = auth.currentUser;
    if (!user) throw new Error('Sesion no activa');
    const idToken = await user.getIdToken();
    // 1. Consultar liquidaciones
    const liquidaciones = await fetch(`${ADMIN_API_ENDPOINT}/api/panel/finanzas/liquidaciones`, {
      headers: { Authorization: `Bearer ${idToken}` }
    }).then(r => r.json());
    console.log('[Nomina][Test] Liquidaciones:', liquidaciones);
    // 2. Ejecutar pago
    const pago = await fetch(`${ADMIN_API_ENDPOINT}/api/panel/finanzas/registrar-pago-deuda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid, monto_pago: montoPago })
    }).then(r => r.json());
    console.log('[Nomina][Test] Resultado pago:', pago);
    // 3. Consultar liquidaciones nuevamente
    const liquidaciones2 = await fetch(`${ADMIN_API_ENDPOINT}/api/panel/finanzas/liquidaciones`, {
      headers: { Authorization: `Bearer ${idToken}` }
    }).then(r => r.json());
    console.log('[Nomina][Test] Liquidaciones tras pago:', liquidaciones2);
    alert('Validacion de nomina completada. Revisa la consola para detalles.');
  } catch (e) {
    alert('Error en validacion de nomina: ' + e.message);
  }
};

const ui = {
  loginSection: document.getElementById("login-section"),
  dashboardSection: document.getElementById("dashboard-section"),
  sessionBox: document.getElementById("session-box"),
  sessionEmail: document.getElementById("session-email"),
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  loginError: document.getElementById("login-error"),
  btnLogout: document.getElementById("btn-logout"),
  tableBody: document.getElementById("drivers-table-body"),
  metricDrivers: document.getElementById("metric-drivers"),
  metricBlockedManual: document.getElementById("metric-blocked-manual"),
  metricBlockedDebt: document.getElementById("metric-blocked-debt"),
  metricBlockedTotal: document.getElementById("metric-blocked-total"),
  metricOrders: document.getElementById("metric-orders"),
  metricPedidosCreados: document.getElementById("metric-pedidos-creados"),
  metricPedidosEntregados: document.getElementById("metric-pedidos-entregados"),
  metricPedidosCancelados: document.getElementById("metric-pedidos-cancelados"),
  metricConductoresActivos: document.getElementById("metric-conductores-activos"),
  metricTiempoAsignacion: document.getElementById("metric-tiempo-asignacion"),
  metricTiempoEntrega: document.getElementById("metric-tiempo-entrega"),
  metricFraudesDetectados: document.getElementById("metric-fraudes-detectados"),
  orderForm: document.getElementById("manual-order-form"),
  orderClient: document.getElementById("order-client"),
  orderPhone: document.getElementById("order-phone"),
  orderAddress: document.getElementById("order-address"),
  orderPlaceType: document.getElementById("order-place-type"),
  orderDeliveryMethod: document.getElementById("order-delivery-method"),
  orderReference: document.getElementById("order-reference"),
  orderLocationNotes: document.getElementById("order-location-notes"),
  orderClientLat: document.getElementById("order-client-lat"),
  orderClientLng: document.getElementById("order-client-lng"),
  orderStoreLat: document.getElementById("order-store-lat"),
  orderStoreLng: document.getElementById("order-store-lng"),
  orderItems: document.getElementById("order-items"),
  orderSubtotal: document.getElementById("order-subtotal"),
  orderShipping: document.getElementById("order-shipping"),
  orderTip: document.getElementById("order-tip"),
  orderPaymentMethod: document.getElementById("order-payment-method"),
  orderTotal: document.getElementById("order-total"),
  orderNotes: document.getElementById("order-notes"),
  orderPreview: document.getElementById("order-preview"),
  previewLocation: document.querySelector("[data-preview-location]"),
  previewOpenMaps: document.getElementById("preview-open-maps"),
  previewCopyLocation: document.getElementById("preview-copy-location"),
  locationSearch: document.getElementById("location-search"),
  locationSearchBtn: document.getElementById("location-search-btn"),
  locationFoundAddress: document.getElementById("location-found-address"),
  locationFoundStatus: document.getElementById("location-found-status"),
  locationCoordsPreview: document.getElementById("location-coords-preview"),
  locationCaptureState: document.getElementById("location-capture-state"),
  useCurrentLocation: document.getElementById("use-current-location"),
  confirmLocation: document.getElementById("confirm-location"),
  targetClient: document.getElementById("target-client"),
  targetStore: document.getElementById("target-store"),
  orderMap: document.getElementById("order-map"),
  orderSubmit: document.getElementById("order-submit"),
  orderFeedback: document.getElementById("order-feedback"),
  restaurantForm: document.getElementById("restaurant-onboarding-form"),
  restaurantName: document.getElementById("restaurant-name"),
  restaurantOwner: document.getElementById("restaurant-owner"),
  restaurantPhone: document.getElementById("restaurant-phone"),
  restaurantWhatsapp: document.getElementById("restaurant-whatsapp"),
  restaurantEmail: document.getElementById("restaurant-email"),
  restaurantHours: document.getElementById("restaurant-hours"),
  restaurantAddress: document.getElementById("restaurant-address"),
  restaurantLat: document.getElementById("restaurant-lat"),
  restaurantLng: document.getElementById("restaurant-lng"),
  restaurantCommission: document.getElementById("restaurant-commission"),
  restaurantZone: document.getElementById("restaurant-zone"),
  restaurantUser: document.getElementById("restaurant-user"),
  restaurantState: document.getElementById("restaurant-state"),
  restaurantMenu: document.getElementById("restaurant-menu"),
  restaurantNotes: document.getElementById("restaurant-notes"),
  restaurantSubmit: document.getElementById("restaurant-submit"),
  restaurantFeedback: document.getElementById("restaurant-feedback"),
  restaurantRefresh: document.getElementById("restaurant-refresh"),
  restaurantListBody: document.getElementById("restaurant-list-body"),
  restaurantCount: document.getElementById("restaurant-count"),
  restaurantActiveCount: document.getElementById("restaurant-active-count"),
  restaurantPendingCount: document.getElementById("restaurant-pending-count"),
  restaurantRecentCount: document.getElementById("restaurant-recent-count"),
  restaurantLastName: document.getElementById("restaurant-last-name"),
  restaurantLastTime: document.getElementById("restaurant-last-time"),
  restaurantLastStatus: document.getElementById("restaurant-last-status"),
  restaurantFilterAll: document.getElementById("restaurant-filter-all"),
  restaurantFilterActive: document.getElementById("restaurant-filter-active"),
  restaurantFilterPending: document.getElementById("restaurant-filter-pending"),
  restaurantFilterSuspended: document.getElementById("restaurant-filter-suspended")
};

let currentDrivers = {};
let activeDriversBasePath = "usuarios/repartidores";
let dashboardListenersAttached = false;
let dashboardPollingId = null;
let activeAdminUser = null;
let dashboardSyncInFlight = false;
let restaurantFilterState = 'all';
let orderMapInstance = null;
let orderMapReady = false;
let orderMapMarker = null;
let reverseLookupInFlight = false;
let activeLocationTarget = "client";
let locationState = {
  client: { lat: 16.75, lng: -93.12, address: "", label: "" },
  store: { lat: 16.7527, lng: -93.1134, address: "", label: "" }
};
const GOV_DEFAULT_PAGE = "gov-overview";

function getValidGovPage(pageId) {
  const normalized = String(pageId || "").replace(/^#/, "").trim();
  return document.querySelector(`[data-gov-page="${normalized}"]`) ? normalized : GOV_DEFAULT_PAGE;
}

function setGovPage(pageId, options = {}) {
  const target = getValidGovPage(pageId);
  document.querySelectorAll("[data-gov-page]").forEach((section) => {
    section.classList.toggle("is-active", section.dataset.govPage === target);
  });
  document.querySelectorAll("[data-gov-nav]").forEach((link) => {
    link.classList.toggle("active", link.dataset.govNav === target);
  });

  if (options.updateHash !== false && window.location.hash !== `#${target}`) {
    window.history.replaceState(null, "", `#${target}`);
  }

  if (options.scroll !== false) {
    document.querySelector(".wc-main")?.scrollTo?.({ top: 0, behavior: "smooth" });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}

function getActiveLocation() {
  return locationState[activeLocationTarget];
}

function updateTargetButtons() {
  if (ui.targetClient) {
    ui.targetClient.className = activeLocationTarget === "client"
      ? "bg-panel-accent px-3 py-2 text-xs font-bold text-slate-950"
      : "bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200";
  }
  if (ui.targetStore) {
    ui.targetStore.className = activeLocationTarget === "store"
      ? "bg-panel-accent px-3 py-2 text-xs font-bold text-slate-950"
      : "bg-slate-900/60 px-3 py-2 text-xs font-semibold text-slate-200";
  }
}

function setActiveLocationTarget(target) {
  activeLocationTarget = target === "store" ? "store" : "client";
  updateTargetButtons();
  const active = getActiveLocation();
  if (ui.locationCaptureState) {
    ui.locationCaptureState.textContent = activeLocationTarget === "client"
      ? "Capturando ubicación del cliente."
      : "Capturando ubicación de la tienda.";
  }
  if (ui.locationFoundAddress) {
    ui.locationFoundAddress.textContent = active.address || "Sin ubicación aun";
  }
  if (ui.locationCoordsPreview) {
    ui.locationCoordsPreview.textContent = coordenadaValida(active.lat, active.lng)
      ? `${active.lat.toFixed(6)}, ${active.lng.toFixed(6)}`
      : "Lat/Lng pendientes";
  }
  if (orderMapInstance && coordenadaValida(active.lat, active.lng)) {
    updateMapMarker(active.lat, active.lng, 17);
  }
  renderOrderPreview();
  updateOrderValidationState();
}

function setSelectedLocation(next = {}) {
  const current = getActiveLocation();
  const updated = {
    lat: Number.isFinite(next.lat) ? next.lat : current.lat,
    lng: Number.isFinite(next.lng) ? next.lng : current.lng,
    address: String(next.address || current.address || "").trim(),
    label: String(next.label || current.label || "").trim()
  };
  locationState[activeLocationTarget] = updated;

  if (activeLocationTarget === "client") {
    if (ui.orderClientLat) ui.orderClientLat.value = String(updated.lat);
    if (ui.orderClientLng) ui.orderClientLng.value = String(updated.lng);
  } else {
    if (ui.orderStoreLat) ui.orderStoreLat.value = String(updated.lat);
    if (ui.orderStoreLng) ui.orderStoreLng.value = String(updated.lng);
  }
  if (ui.orderAddress && updated.address) ui.orderAddress.value = updated.address;

  if (ui.locationFoundAddress) {
    ui.locationFoundAddress.textContent = updated.address || "Sin ubicación aun";
  }
  if (ui.locationCaptureState) {
    ui.locationCaptureState.textContent = updated.label || (activeLocationTarget === "client"
      ? "Capturando ubicación del cliente."
      : "Capturando ubicacion de la tienda.");
  }
  if (ui.locationCoordsPreview) {
    ui.locationCoordsPreview.textContent = coordenadaValida(updated.lat, updated.lng)
      ? `${updated.lat.toFixed(6)}, ${updated.lng.toFixed(6)}`
      : "Lat/Lng pendientes";
  }
  renderOrderPreview();
  updateOrderValidationState();
}

function coordenadaValida(lat, lng) {
  return Number.isFinite(lat) && Number.isFinite(lng) &&
    lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
}

function buildMapsUrl(lat, lng) {
  if (!coordenadaValida(lat, lng)) return "";
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function updatePreviewActions(lat, lng, locationSummary) {
  const mapsUrl = buildMapsUrl(lat, lng);
  if (ui.previewOpenMaps) {
    ui.previewOpenMaps.href = mapsUrl || "#";
    ui.previewOpenMaps.style.pointerEvents = mapsUrl ? "auto" : "none";
    ui.previewOpenMaps.style.opacity = mapsUrl ? "1" : "0.5";
    ui.previewOpenMaps.setAttribute("aria-disabled", mapsUrl ? "false" : "true");
  }
  if (ui.previewCopyLocation) {
    ui.previewCopyLocation.disabled = !locationSummary;
  }
  return mapsUrl;
}

function syncLocationFromMapCenter(labelConfirmado) {
  if (!orderMapInstance) return null;
  const center = orderMapInstance.getCenter();
  const lat = Number(center.lat);
  const lng = Number(center.lng);
  if (!coordenadaValida(lat, lng)) return null;
  const active = getActiveLocation();
  const updated = {
    lat,
    lng,
    address: active.address || String(ui.locationSearch?.value || "").trim(),
    label: labelConfirmado || "Ubicación actualizada"
  };
  locationState[activeLocationTarget] = updated;
  if (activeLocationTarget === "client") {
    if (ui.orderClientLat) ui.orderClientLat.value = String(lat);
    if (ui.orderClientLng) ui.orderClientLng.value = String(lng);
  } else {
    if (ui.orderStoreLat) ui.orderStoreLat.value = String(lat);
    if (ui.orderStoreLng) ui.orderStoreLng.value = String(lng);
  }
  if (ui.locationFoundAddress) {
    ui.locationFoundAddress.textContent = updated.address || "Sin ubicación aun";
  }
  if (ui.locationCoordsPreview) {
    ui.locationCoordsPreview.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;
  }
  if (ui.locationCaptureState) {
    ui.locationCaptureState.textContent = updated.label;
  }
  renderOrderPreview();
  updateOrderValidationState();
  return updated;
}

function updateMapMarker(lat, lng, zoom = 17) {
  if (!orderMapInstance || !coordenadaValida(lat, lng)) return;
  if (typeof orderMapInstance.setView === 'function') {
    orderMapInstance.setView([lat, lng], zoom, { animate: true });
  }
  if (orderMapMarker && typeof orderMapMarker.setLatLng === 'function') {
    orderMapMarker.setLatLng([lat, lng]);
  }
}

async function geocodeAddress(query) {
  const normalized = String(query || "").trim();
  if (!normalized) return null;
  const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q=${encodeURIComponent(normalized)}`, {
    headers: {
      "Accept": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Geocoding HTTP ${response.status}`);
  }
  const results = await response.json();
  const first = Array.isArray(results) ? results[0] : null;
  if (!first) return null;
  return {
    lat: Number(first.lat),
    lng: Number(first.lon),
    address: first.display_name || normalized
  };
}

async function reverseGeocode(lat, lng) {
  if (!coordenadaValida(lat, lng)) return null;
  const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`, {
    headers: {
      "Accept": "application/json"
    }
  });
  if (!response.ok) {
    throw new Error(`Reverse geocoding HTTP ${response.status}`);
  }
  const payload = await response.json();
  return payload?.display_name || "";
}

async function refreshLocationFromCenter(trigger = "moved") {
  if (!orderMapInstance || reverseLookupInFlight) return;
  const center = orderMapInstance.getCenter();
  const lat = Number(center.lat);
  const lng = Number(center.lng);
  reverseLookupInFlight = true;
  try {
    const address = await reverseGeocode(lat, lng);
    setSelectedLocation({
      lat,
      lng,
      address: address || getActiveLocation().address,
      label: trigger === "search" ? "Dirección encontrada" : "Ubicación actualizada"
    });
  } catch (_error) {
    setSelectedLocation({
      lat,
      lng,
      label: "Ubicación técnica actualizada"
    });
  } finally {
    reverseLookupInFlight = false;
  }
}

function initOrderMap() {
  if (orderMapReady || !ui.orderMap) return;

  ui.orderMap.innerHTML = `
    <div class="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-2xl border border-panel-line bg-slate-950/35 p-6 text-center">
      <div class="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-100">
        Mapa local
      </div>
      <h4 class="text-base font-semibold text-slate-100">Mapa sin dependencias externas</h4>
      <p class="max-w-md text-sm leading-6 text-slate-300">
        La captura de ubicaci&oacute;n opera con coordenadas y b&uacute;squeda manual, sin depender de Leaflet ni de tiles remotos.
      </p>
      <p class="text-xs text-slate-400">Coordenadas activas: ${getActiveLocation().lat.toFixed(6)}, ${getActiveLocation().lng.toFixed(6)}</p>
    </div>
  `;

  orderMapInstance = {
    getCenter() {
      return {
        lat: getActiveLocation().lat,
        lng: getActiveLocation().lng
      };
    },
    setView() {
      return this;
    }
  };
  orderMapReady = true;
}

function escapeHtml(value) {
  return String(value || "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function normalizeLevel(value) {
  const raw = String(value || "").toUpperCase();
  if (["BRONCE", "PLATA", "ORO", "DIAMANTE"].includes(raw)) {
    return raw;
  }
  return "BRONCE";
}

function money(value) {
  const amount = Number(value || 0);
  return Number.isFinite(amount) ? amount.toFixed(2) : "0.00";
}

function calcularSubtotalDesdeItems(texto) {
  try {
    return parseOrderItems(texto).reduce((sum, item) => sum + (Number(item.precio) * Number(item.cantidad)), 0);
  } catch (_error) {
    return 0;
  }
}

function sincronizarMontosAutomaticos() {
  const subtotal = calcularSubtotalDesdeItems(String(ui.orderItems?.value || ""));
  if (ui.orderSubtotal) {
    ui.orderSubtotal.value = subtotal > 0 ? subtotal.toFixed(2) : "";
  }

  if (ui.orderShipping) {
    ui.orderShipping.value = String(Number(ui.orderShipping.value || 45) || 45);
    if (!ui.orderShipping.value || Number(ui.orderShipping.value) < 45) {
      ui.orderShipping.value = "45.00";
    }
  }

  updateOrderTotalValue();
}

function clasificarRepartidor(data = {}) {
  const deuda = Number(data?.finanzas?.deuda_actual || data?.deuda_actual || 0);
  const limiteDeuda = Number(data?.finanzas?.limite_deuda || 0);
  const bloqueoManual = data?.estatus?.bloqueo_manual === true || data?.bloqueado_por_deuda === true;
  const bloqueoPorDeuda = data?.estatus?.bloqueado_por_deuda === true
    || data?.perfil?.bloqueado_por_deuda === true
    || (limiteDeuda > 0 && deuda > limiteDeuda);

  return {
    deuda,
    limiteDeuda,
    bloqueoManual,
    bloqueoPorDeuda,
    noElegible: bloqueoManual || bloqueoPorDeuda
  };
}

function isAuthorizedEmail(email) {
  return AUTHORIZED_ADMIN_EMAILS.has(String(email || "").toLowerCase());
}

function setLoginError(message) {
  if (!message) {
    ui.loginError.classList.add("hidden");
    ui.loginError.textContent = "";
    return;
  }
  ui.loginError.textContent = message;
  ui.loginError.classList.remove("hidden");
}

function setOrderFeedback(message, type = "ok") {
  ui.orderFeedback.textContent = message;
  ui.orderFeedback.classList.remove("hidden");
  if (type === "ok") {
    ui.orderFeedback.className = "mt-3 rounded-lg bg-emerald-900/40 px-3 py-2 text-xs text-emerald-200";
    return;
  }
  ui.orderFeedback.className = "mt-3 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-200";
}

function setRestaurantFeedback(message, type = "ok") {
  if (!ui.restaurantFeedback) return;
  ui.restaurantFeedback.textContent = message;
  ui.restaurantFeedback.classList.remove("hidden");
  if (type === "ok") {
    ui.restaurantFeedback.className = "mt-3 rounded-lg bg-emerald-900/40 px-3 py-2 text-xs text-emerald-200";
    return;
  }
  ui.restaurantFeedback.className = "mt-3 rounded-lg bg-red-900/40 px-3 py-2 text-xs text-red-200";
}

function applyRestaurantStatusChip(status) {
  if (!ui.restaurantLastStatus) return;
  const normalized = String(status || '').trim().toLowerCase();
  const baseClasses = 'mt-1 inline-flex w-fit items-center rounded-full px-2.5 py-1 text-xs font-semibold';
  const statusClasses = {
    activo: 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/30',
    'en revision': 'bg-amber-400/15 text-amber-200 border border-amber-400/30',
    suspendido: 'bg-red-400/15 text-red-200 border border-red-400/30'
  };
  ui.restaurantLastStatus.className = `${baseClasses} ${statusClasses[normalized] || 'bg-slate-700/40 text-slate-200 border border-slate-600/50'}`;
}

function getRestaurantStatusChipClass(status) {
  const normalized = String(status || '').trim().toLowerCase();
  const baseClasses = 'inline-flex w-fit items-center rounded-full px-2.5 py-1 text-[11px] font-semibold';
  const statusClasses = {
    activo: 'bg-emerald-400/15 text-emerald-200 border border-emerald-400/30',
    'en revision': 'bg-amber-400/15 text-amber-200 border border-amber-400/30',
    suspendido: 'bg-red-400/15 text-red-200 border border-red-400/30'
  };
  return `${baseClasses} ${statusClasses[normalized] || 'bg-slate-700/40 text-slate-200 border border-slate-600/50'}`;
}

function matchesRestaurantFilter(restaurant) {
  const estado = String(restaurant?.estado || '').trim().toLowerCase();
  if (restaurantFilterState === 'active') return estado === 'activo';
  if (restaurantFilterState === 'pending') return estado === 'en revision';
  if (restaurantFilterState === 'suspended') return estado === 'suspendido';
  return true;
}

function updateRestaurantFilterButtons() {
  const buttons = [
    [ui.restaurantFilterAll, 'all'],
    [ui.restaurantFilterActive, 'active'],
    [ui.restaurantFilterPending, 'pending'],
    [ui.restaurantFilterSuspended, 'suspended']
  ];
  buttons.forEach(([button, key]) => {
    if (!button) return;
    button.className = restaurantFilterState === key
      ? 'nelly-btn nelly-btn--accent'
      : 'nelly-btn nelly-btn--ghost';
  });
}

function renderRestaurantList(restaurantes = []) {
  if (ui.restaurantCount) {
    ui.restaurantCount.textContent = `${restaurantes.length} registros`;
  }
  const activos = Array.isArray(restaurantes)
    ? restaurantes.filter((restaurant) => String(restaurant?.estado || '').toLowerCase() === 'activo').length
    : 0;
  const pendientes = Array.isArray(restaurantes)
    ? restaurantes.filter((restaurant) => String(restaurant?.estado || '').toLowerCase() === 'en revision').length
    : 0;
  const recientes = Array.isArray(restaurantes)
    ? restaurantes.slice().sort((a, b) => Number(b?.creado_en || 0) - Number(a?.creado_en || 0)).slice(0, 3).length
    : 0;

  if (ui.restaurantActiveCount) {
    ui.restaurantActiveCount.textContent = String(activos);
  }
  if (ui.restaurantPendingCount) {
    ui.restaurantPendingCount.textContent = String(pendientes);
  }
  if (ui.restaurantRecentCount) {
    ui.restaurantRecentCount.textContent = String(recientes);
  }
  const sorted = Array.isArray(restaurantes)
    ? restaurantes.slice().sort((a, b) => Number(b?.creado_en || 0) - Number(a?.creado_en || 0))
    : [];
  const latest = sorted[0];
  if (ui.restaurantLastName) {
    ui.restaurantLastName.textContent = latest?.nombre_comercial || latest?.nombre || 'Sin registros aun';
  }
  if (ui.restaurantLastTime) {
    const timestamp = Number(latest?.creado_en || 0);
    ui.restaurantLastTime.textContent = Number.isFinite(timestamp) && timestamp > 0
      ? `Registrado el ${new Date(timestamp).toLocaleString('es-MX')}`
      : 'Hora pendiente';
  }
  if (ui.restaurantLastStatus) {
    ui.restaurantLastStatus.textContent = latest?.estado
      ? `Estado actual: ${latest.estado}`
      : 'Estado pendiente';
    applyRestaurantStatusChip(latest?.estado);
  }
  if (!ui.restaurantListBody) return;

  const filteredRestaurants = Array.isArray(restaurantes) ? restaurantes.filter(matchesRestaurantFilter) : [];

  if (!Array.isArray(filteredRestaurants) || filteredRestaurants.length === 0) {
    ui.restaurantListBody.innerHTML = `
      <tr>
        <td colspan="6" class="px-3 py-4 text-center text-sm text-slate-400">Sin restaurantes registrados todavia.</td>
      </tr>
    `;
    return;
  }

  ui.restaurantListBody.innerHTML = filteredRestaurants.map((restaurant) => `
    <tr class="border-t border-panel-line/40">
      <td class="px-3 py-3 font-semibold text-slate-100">${escapeHtml(restaurant.nombre_comercial || restaurant.nombre || 'Sin nombre')}</td>
      <td class="px-3 py-3 text-slate-300">${escapeHtml(restaurant.responsable || 'Sin responsable')}</td>
      <td class="px-3 py-3 text-slate-300">
        <span class="${getRestaurantStatusChipClass(restaurant.estado)}">${escapeHtml(restaurant.estado || 'Sin estado')}</span>
      </td>
      <td class="px-3 py-3 text-slate-300">${escapeHtml(restaurant.zona_cobertura || 'Sin zona')}</td>
      <td class="px-3 py-3 text-slate-400">${escapeHtml(restaurant.origen || 'firebase-rtdb')}</td>
      <td class="px-3 py-3 text-right">
        <button
          type="button"
          class="nelly-btn nelly-btn--ghost restaurant-mark-active-btn"
          data-restaurant-id="${escapeHtml(restaurant.id || '')}"
          data-restaurant-name="${escapeHtml(restaurant.nombre_comercial || restaurant.nombre || 'Sin nombre')}"
          ${String(restaurant.estado || '').trim().toLowerCase() === 'activo' ? 'disabled' : ''}
        >
          Marcar activo
        </button>
      </td>
    </tr>
  `).join('');
}

async function updateRestaurantState(restaurantId, estado) {
  const user = auth.currentUser;
  if (!user) {
    throw new Error('Sesion no activa');
  }

  const idToken = await user.getIdToken();
  const response = await fetch(`${ADMIN_API_ENDPOINT}/api/admin/restaurantes/${encodeURIComponent(restaurantId)}/estado`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`
    },
    body: JSON.stringify({ estado })
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok || !payload?.ok) {
    throw new Error(payload?.error || 'No se pudo actualizar el estado del restaurante');
  }
  return payload;
}

async function refreshRestaurantList() {
  try {
    const user = auth.currentUser;
    if (!user) {
      renderRestaurantList([]);
      return;
    }
    const idToken = await user.getIdToken();
    const response = await fetch(`${ADMIN_API_ENDPOINT}/api/admin/restaurantes`, {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || 'No se pudo listar restaurantes');
    }
    renderRestaurantList(Array.isArray(payload.restaurantes) ? payload.restaurantes : []);
  } catch (error) {
    renderRestaurantList([]);
    setRestaurantFeedback(`No se pudo actualizar la lista: ${error.message}`, 'error');
  }
}

function switchToDashboard(email) {
  ui.loginSection.classList.add("hidden");
  ui.dashboardSection.classList.remove("hidden");
  ui.sessionBox.classList.remove("hidden");
  ui.sessionBox.classList.add("flex");
  ui.sessionEmail.textContent = email;
  setGovPage(window.location.hash || GOV_DEFAULT_PAGE, { scroll: false });
}

function switchToLogin() {
  ui.dashboardSection.classList.add("hidden");
  ui.loginSection.classList.remove("hidden");
  ui.sessionBox.classList.add("hidden");
  ui.sessionBox.classList.remove("flex");
  ui.tableBody.innerHTML = "";
  ui.metricDrivers.textContent = "0";
  ui.metricBlockedManual.textContent = "0";
  ui.metricBlockedDebt.textContent = "0";
  ui.metricBlockedTotal.textContent = "0";
  ui.metricOrders.textContent = "0";
}

function setDriversTableMessage(message) {
  ui.tableBody.innerHTML = `<tr><td class="px-3 py-3 text-sm text-slate-400" colspan="4">${escapeHtml(message)}</td></tr>`;
}

function renderDriversTable(drivers) {
  const rows = Object.entries(drivers);
  ui.metricDrivers.textContent = String(rows.length);

  let blockedManualCount = 0;
  let blockedDebtCount = 0;
  const noElegibles = new Set();
  const html = rows
    .sort((a, b) => {
      const nameA = String(a[1]?.nombre || a[1]?.displayName || a[0]).toLowerCase();
      const nameB = String(b[1]?.nombre || b[1]?.displayName || b[0]).toLowerCase();
      return nameA.localeCompare(nameB);
    })
    .map(([uid, data]) => {
      const nombre = data?.nombre || data?.displayName || "Sin nombre";
      const nivel = normalizeLevel(data?.estatus?.nivel || data?.nivel);
      const clasificacion = clasificarRepartidor(data);
      const uidSafe = escapeHtml(uid);
      const nombreSafe = escapeHtml(nombre);
      if (clasificacion.bloqueoManual) {
        blockedManualCount += 1;
      }
      if (clasificacion.bloqueoPorDeuda) {
        blockedDebtCount += 1;
      }
      if (clasificacion.noElegible) {
        noElegibles.add(uid);
      }

      return `
        <tr class="border-b border-panel-line/80 hover:bg-slate-900/40">
          <td class="px-2 py-2 font-medium sm:px-3">${nombreSafe}</td>
          <td class="hidden px-3 py-2 text-xs text-slate-300 md:table-cell">${uidSafe}</td>
          <td class="px-2 py-2 sm:px-3">${nivel}</td>
          <td class="px-2 py-2 sm:px-3">$${money(clasificacion.deuda)}</td>
          <td class="px-2 py-2 sm:px-3">
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                data-uid="${uidSafe}"
                class="manual-block-toggle h-4 w-4 accent-panel-warn"
                ${clasificacion.bloqueoManual ? "checked" : ""}
              />
              <span class="text-xs ${clasificacion.noElegible ? "text-red-300" : "text-emerald-300"}">${clasificacion.noElegible ? "No elegible" : "Activo"}</span>
            </label>
          </td>
        </tr>
      `;
    })
    .join("");

  ui.metricBlockedManual.textContent = String(blockedManualCount);
  ui.metricBlockedDebt.textContent = String(blockedDebtCount);
  ui.metricBlockedTotal.textContent = String(noElegibles.size);
  ui.tableBody.innerHTML = html || "<tr><td class=\"px-3 py-3 text-sm text-slate-400\" colspan=\"5\"><div class=\"nelly-empty-state\"><p class=\"nelly-empty-state__title\">Sin repartidores registrados</p><p class=\"nelly-empty-state__body\">Cuando existan conductores activos, apareceran aqui para gestion y control.</p></div></td></tr>";
}

function bindToggleEvents() {
  const toggles = document.querySelectorAll(".manual-block-toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", async (event) => {
      const target = event.target;
      const uid = target.dataset.uid;
      const nextValue = target.checked;

      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error("Sesion no activa");
        }

        const idToken = await user.getIdToken();
        const response = await fetch(`${ADMIN_API_ENDPOINT}/api/admin/repartidores/manual-lock`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
          },
          body: JSON.stringify({ uid, bloqueado: nextValue })
        });

        if (!response.ok) {
          let message = `HTTP ${response.status}`;
          try {
            const payload = await response.json();
            message = payload?.error || message;
          } catch (_parseError) {}
          throw new Error(message);
        }

        syncDashboardData();
      } catch (error) {
        target.checked = !nextValue;
        window.alert(`No se pudo actualizar bloqueo manual: ${error.message}`);
      }
    });
  });
}

async function fetchAdminApi(path, options = {}) {
  const user = auth.currentUser || activeAdminUser;
  if (!user) {
    throw new Error("Sesion no activa");
  }

  const idToken = await user.getIdToken();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

  try {
    const response = await fetch(`${ADMIN_API_ENDPOINT}${path}`, {
      ...options,
      signal: controller.signal,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`,
        ...(options.headers || {})
      }
    });

    if (!response.ok) {
      let message = `HTTP ${response.status}`;
      try {
        const payload = await response.json();
        message = payload?.error || message;
      } catch (_parseError) {}
      throw new Error(message);
    }

    return response.json();
  } catch (error) {
    throw error?.name === "AbortError"
      ? new Error(`Timeout consultando ${path}`)
      : error;
  } finally {
    window.clearTimeout(timeoutId);
  }
}

function updateOrderTotalValue() {
  const subtotal = Number(ui.orderSubtotal.value || 0);
  const shipping = Number(ui.orderShipping.value || 0);
  const tip = Number(ui.orderTip.value || 0);
  const total = Number((subtotal + shipping + tip).toFixed(2));
  ui.orderTotal.value = Number.isFinite(total) ? total : '';
  renderOrderPreview();
  updateOrderValidationState();
}

function renderOrderPreview() {
  if (!ui.orderPreview) {
    return;
  }

  const client = String(ui.orderClient.value || '').trim();
  const address = String(ui.orderAddress.value || '').trim();
  const placeType = String(ui.orderPlaceType.value || 'otro').trim();
  const deliveryMethod = String(ui.orderDeliveryMethod.value || 'puerta').trim();
  const reference = String(ui.orderReference.value || '').trim();
  const locationNotes = String(ui.orderLocationNotes.value || '').trim();
  const itemsText = String(ui.orderItems.value || '').trim();
  const total = String(ui.orderTotal.value || '').trim();
  const paymentMethod = String(ui.orderPaymentMethod.value || 'efectivo').trim();
  const clientLat = Number(ui.orderClientLat.value);
  const clientLng = Number(ui.orderClientLng.value);
  const storeLat = Number(ui.orderStoreLat.value);
  const storeLng = Number(ui.orderStoreLng.value);
  const mapsUrl = buildMapsUrl(clientLat, clientLng);
  const locationSummary = [
    address,
    placeType ? `tipo ${placeType}` : '',
    deliveryMethod ? `entrega ${deliveryMethod}` : '',
    reference ? `ref ${reference}` : ''
  ].filter(Boolean).join(' · ');

  const lines = [
    ['Cliente', client || 'Pendiente'],
    ['Dirección', address || 'Pendiente'],
    ['Tipo', placeType || 'Pendiente'],
    ['Entrega', deliveryMethod || 'Pendiente'],
    ['Referencia', reference || 'Sin referencia'],
    ['Notas', locationNotes || 'Sin notas'],
    ['Items', itemsText ? 'Capturados' : 'Pendientes'],
    ['Pago', paymentMethod || 'Pendiente'],
    ['Cliente GPS', coordenadaValida(clientLat, clientLng) ? `${clientLat.toFixed(5)}, ${clientLng.toFixed(5)}` : 'Pendiente'],
    ['Tienda GPS', coordenadaValida(storeLat, storeLng) ? `${storeLat.toFixed(5)}, ${storeLng.toFixed(5)}` : 'Pendiente'],
    ['Total', total ? `$${Number(total).toFixed(2)}` : 'Pendiente']
  ];

  ui.orderPreview.innerHTML = lines
    .map(([label, value], index) => `
      <div class="rounded-xl border ${index % 2 === 0 ? 'border-emerald-400/20 bg-slate-950/40' : 'border-slate-700/70 bg-slate-950/20'} px-3 py-2 shadow-sm">
        <p class="text-[11px] uppercase tracking-wide text-slate-400">${label}</p>
        <p class="mt-1 font-semibold text-slate-100">${escapeHtml(value)}</p>
      </div>
    `)
    .join('');

  if (ui.previewLocation) {
    ui.previewLocation.textContent = locationSummary || 'Sin ubicación aun';
  }

  if (ui.previewOpenMaps) {
    ui.previewOpenMaps.href = mapsUrl || "#";
    ui.previewOpenMaps.setAttribute("aria-disabled", mapsUrl ? "false" : "true");
    ui.previewOpenMaps.style.pointerEvents = mapsUrl ? "auto" : "none";
    ui.previewOpenMaps.style.opacity = mapsUrl ? "1" : "0.5";
  }

  if (ui.previewCopyLocation) {
    ui.previewCopyLocation.disabled = !locationSummary;
    ui.previewCopyLocation.onclick = async () => {
      if (!locationSummary) return;
      const text = `${locationSummary}${mapsUrl ? ` | ${mapsUrl}` : ''}`;
      try {
        await navigator.clipboard.writeText(text);
        setOrderFeedback('Ubicación copiada al portapapeles.', 'ok');
      } catch (_error) {
        setOrderFeedback('No se pudo copiar la ubicación.', 'error');
      }
    };
  }

  if (ui.locationSearch && ui.locationSearch.value.trim() && !getActiveLocation().address) {
    getActiveLocation().address = ui.locationSearch.value.trim();
  }
}

function setFieldState(input, isValid) {
  if (!input) return;
  if (isValid) {
    input.classList.remove('border-red-400', 'ring-2', 'ring-red-400/30');
    input.classList.add('border-panel-line');
  } else {
    input.classList.add('border-red-400', 'ring-2', 'ring-red-400/30');
    input.classList.remove('border-panel-line');
  }
}

function updateOrderValidationState() {
  const values = {
    client: String(ui.orderClient.value || '').trim(),
    phone: String(ui.orderPhone.value || '').trim(),
    address: String(ui.orderAddress.value || '').trim(),
    clientLat: Number(ui.orderClientLat.value),
    clientLng: Number(ui.orderClientLng.value),
    storeLat: Number(ui.orderStoreLat.value),
    storeLng: Number(ui.orderStoreLng.value),
    items: String(ui.orderItems.value || '').trim(),
    subtotal: Number(ui.orderSubtotal.value || 0),
    shipping: Number(ui.orderShipping.value || 0),
    tip: Number(ui.orderTip.value || 0)
  };

  const coordenadaOk = coordenadaValida(values.clientLat, values.clientLng) && coordenadaValida(values.storeLat, values.storeLng);
  const itemsOk = values.items.length > 0;
  const amountsOk = Number.isFinite(values.subtotal) && values.subtotal > 0
    && Number.isFinite(values.shipping) && values.shipping >= 0
    && Number.isFinite(values.tip) && values.tip >= 0;

  const validations = [
    [ui.orderClient, values.client.length > 0],
    [ui.orderPhone, values.phone.length > 0],
    [ui.orderAddress, values.address.length > 0],
    [ui.orderPlaceType, String(ui.orderPlaceType.value || '').trim().length > 0],
    [ui.orderDeliveryMethod, String(ui.orderDeliveryMethod.value || '').trim().length > 0],
    [ui.orderClientLat, coordenadaOk],
    [ui.orderClientLng, coordenadaOk],
    [ui.orderStoreLat, coordenadaOk],
    [ui.orderStoreLng, coordenadaOk],
    [ui.orderItems, itemsOk],
    [ui.orderSubtotal, amountsOk && values.subtotal > 0],
    [ui.orderShipping, amountsOk],
    [ui.orderTip, amountsOk],
    [ui.orderPaymentMethod, String(ui.orderPaymentMethod.value || '').trim().length > 0]
  ];

  validations.forEach(([input, ok]) => setFieldState(input, ok));

  const canSubmit = validations.every(([, ok]) => ok);
  if (ui.orderSubmit) {
    ui.orderSubmit.disabled = !canSubmit;
  }

  if (ui.orderPreview) {
    const head = ui.orderPreview.querySelector('[data-preview-head]');
    if (head) {
      head.textContent = canSubmit ? 'Pedido listo para crear' : 'Completa los campos requeridos';
      head.className = canSubmit
        ? 'text-sm font-semibold text-emerald-200'
        : 'text-sm font-semibold text-amber-200';
    }
  }

  return canSubmit;
}

async function refreshDriversFromBackend() {
  const payload = await fetchAdminApi("/api/admin/repartidores");
  activeDriversBasePath = payload?.source || "repartidores";
  currentDrivers = payload?.drivers || {};
  renderDriversTable(currentDrivers);
  bindToggleEvents();
}

async function refreshOrdersMetricsFromBackend() {
  const payload = await fetchAdminApi("/api/admin/pedidos/metricas");
  ui.metricOrders.textContent = String(Number(payload?.activos || 0));
  ui.metricPedidosCreados.textContent = String(Number(payload?.pedidosCreadosHoy || 0));
  ui.metricPedidosEntregados.textContent = String(Number(payload?.pedidosEntregadosHoy || 0));
  ui.metricPedidosCancelados.textContent = String(Number(payload?.pedidosCanceladosHoy || 0));
  ui.metricConductoresActivos.textContent = String(Number(payload?.conductoresActivos || 0));
  ui.metricTiempoAsignacion.textContent = `${Number(payload?.avgAsignacionMinutos || 0).toFixed(1)} min`;
  ui.metricTiempoEntrega.textContent = `${Number(payload?.avgEntregaMinutos || 0).toFixed(1)} min`;
  ui.metricFraudesDetectados.textContent = String(Number(payload?.fraudesDetectadosHoy || 0));
}

async function syncDashboardData() {
  if (dashboardSyncInFlight) {
    return;
  }

  dashboardSyncInFlight = true;
  try {
    await Promise.all([
      refreshDriversFromBackend(),
      refreshOrdersMetricsFromBackend(),
      refreshRentabilidadMetrics()
    ]);
  } catch (error) {
    currentDrivers = {};
    ui.metricDrivers.textContent = "0";
    ui.metricBlockedManual.textContent = "0";
    ui.metricBlockedDebt.textContent = "0";
    ui.metricBlockedTotal.textContent = "0";
    ui.metricOrders.textContent = "0";
    ui.metricPedidosCreados.textContent = "0";
    ui.metricPedidosEntregados.textContent = "0";
    ui.metricPedidosCancelados.textContent = "0";
    ui.metricConductoresActivos.textContent = "0";
    ui.metricTiempoAsignacion.textContent = "0 min";
    ui.metricTiempoEntrega.textContent = "0 min";
    ui.metricFraudesDetectados.textContent = "0";
    setDriversTableMessage(`No se pudo cargar el dashboard: ${error.message}`);
    document.getElementById("metric-ventas-brutas").textContent = "$0.00";
    document.getElementById("metric-comisiones-nelly").textContent = "$0.00";
    document.getElementById("metric-conteo-entregas").textContent = "0";
    document.getElementById("metric-mapa-calor").innerHTML = '<li class="nelly-empty-state nelly-empty-state__body col-span-2">No disponible</li>';
  } finally {
    dashboardSyncInFlight = false;
  }
}

function startDashboardPolling() {
  if (dashboardPollingId) {
    return;
  }

  syncDashboardData();
  dashboardPollingId = window.setInterval(() => {
    syncDashboardData();
  }, 30000);
}

function stopDashboardPolling() {
  if (!dashboardPollingId) {
    return;
  }

  window.clearInterval(dashboardPollingId);
  dashboardPollingId = null;
}

function parseOrderItems(text) {
  const lines = String(text || '').split(/\r?\n/).map(line => line.trim()).filter(Boolean);
  if (!lines.length) return [];

  return lines.map((line, index) => {
    let quantity = 1;
    let description = line;

    const quantityMatch = description.match(/^([0-9]+(?:[.,][0-9]+)?)\s*x\s+/i);
    if (quantityMatch) {
      quantity = Number(quantityMatch[1].replace(',', '.')) || 1;
      description = description.slice(quantityMatch[0].length).trim();
    } else {
      const firstToken = description.split(/\s+/)[0];
      const maybeQty = Number(firstToken.replace(',', '.'));
      if (Number.isFinite(maybeQty) && maybeQty > 0 && description.split(/\s+/).length > 1) {
        quantity = maybeQty;
        description = description.split(/\s+/).slice(1).join(' ').trim();
      }
    }

    const tokens = description.split(/\s+/);
    if (tokens.length < 2) {
      throw new Error(`Item invalido en la linea ${index + 1}: ${line}`);
    }

    const rawPrice = tokens[tokens.length - 1].replace(/\$/g, '').replace(',', '.');
    const price = Number(rawPrice);
    if (!Number.isFinite(price) || price <= 0) {
      throw new Error(`Precio invalido en la linea ${index + 1}: ${line}`);
    }

    const name = tokens.slice(0, -1).join(' ').trim();
    if (!name) {
      throw new Error(`Nombre de item invalido en la linea ${index + 1}: ${line}`);
    }

    return {
      nombre: name,
      cantidad: Number.isFinite(quantity) && quantity > 0 ? quantity : 1,
      precio: Number(price.toFixed(2))
    };
  });
}

async function createManualOrder(event) {
  event.preventDefault();

  const client = String(ui.orderClient.value || '').trim();
  const phone = String(ui.orderPhone.value || '').trim();
  const address = String(ui.orderAddress.value || '').trim();
  const placeType = String(ui.orderPlaceType.value || 'otro').trim();
  const deliveryMethod = String(ui.orderDeliveryMethod.value || 'puerta').trim();
  const reference = String(ui.orderReference.value || '').trim();
  const locationNotes = String(ui.orderLocationNotes.value || '').trim();
  const clientLat = Number(ui.orderClientLat.value);
  const clientLng = Number(ui.orderClientLng.value);
  const storeLat = Number(ui.orderStoreLat.value);
  const storeLng = Number(ui.orderStoreLng.value);
  const itemsText = String(ui.orderItems.value || '').trim();
  const subtotal = Number(ui.orderSubtotal.value || 0);
  const shipping = Number(ui.orderShipping.value || 0);
  const tip = Number(ui.orderTip.value || 0);
  const paymentMethod = String(ui.orderPaymentMethod.value || 'efectivo').trim();
  const notes = String(ui.orderNotes.value || '').trim();

  if (!client || !phone || !address || !itemsText) {
    setOrderFeedback('Completa cliente, telefono, direccion y lista de items.', 'error');
    return;
  }

  if (!coordenadaValida(clientLat, clientLng) || !coordenadaValida(storeLat, storeLng)) {
    setOrderFeedback('Ingresa coordenadas validas para cliente y tienda.', 'error');
    return;
  }

  if (!Number.isFinite(subtotal) || subtotal <= 0) {
    setOrderFeedback('Subtotal debe ser un numero mayor a cero.', 'error');
    return;
  }

  if (!Number.isFinite(shipping) || shipping < 0) {
    setOrderFeedback('Costo de envio invalido.', 'error');
    return;
  }

  if (!Number.isFinite(tip) || tip < 0) {
    setOrderFeedback('Propina invalida.', 'error');
    return;
  }

  let items;
  try {
    items = parseOrderItems(itemsText);
  } catch (parseError) {
    setOrderFeedback(parseError.message, 'error');
    return;
  }

  if (!Array.isArray(items) || items.length === 0) {
    setOrderFeedback('Agrega al menos un item valido al pedido.', 'error');
    return;
  }

  const expectedSubtotal = Number(items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0).toFixed(2));
  if (Math.abs(expectedSubtotal - subtotal) > 0.01) {
    setOrderFeedback(`El subtotal no coincide con la suma de items (${expectedSubtotal}).`, 'error');
    return;
  }

  const total = Number((subtotal + shipping + tip).toFixed(2));
  ui.orderTotal.value = total;
  const locationSummary = [
    address,
    placeType ? `tipo ${placeType}` : '',
    deliveryMethod ? `entrega ${deliveryMethod}` : '',
    reference ? `ref ${reference}` : ''
  ].filter(Boolean).join(' · ');

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error('Sesion no activa');
    }

    const idToken = await user.getIdToken();
    let created = false;
    let pedidoId = null;

    const response = await fetch(`${ADMIN_API_ENDPOINT}/api/admin/pedidos`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        cliente_nombre: client,
        telefono: phone,
        direccion: address,
        tipo_ubicacion: placeType,
        metodo_entrega: deliveryMethod,
        referencia_ubicacion: reference,
        notas_ubicacion: locationNotes,
        cliente_lat: clientLat,
        cliente_lng: clientLng,
        tienda_lat: storeLat,
        tienda_lng: storeLng,
        descripcion: notes || 'Pedido telefonico',
        items,
        subtotal: Number(subtotal.toFixed(2)),
        costo_envio: Number(shipping.toFixed(2)),
        propina: Number(tip.toFixed(2)),
        total,
        pago: {
          metodo: paymentMethod,
          estado: 'pendiente'
        }
      })
    });

    const payload = await response.json().catch(() => ({}));

    if (response.ok) {
      pedidoId = payload?.id || null;
      created = true;
    }

    if (!created) {
      throw new Error(payload?.error || 'No se pudo crear pedido en backend');
    }

    ui.orderForm.reset();
    if (ui.orderShipping) {
      ui.orderShipping.value = "45.00";
    }
    if (ui.orderSubtotal) {
      ui.orderSubtotal.value = "";
    }
    ui.orderTotal.value = '';
    setOrderFeedback(`Pedido ${pedidoId || 'manual'} creado correctamente. Ubicacion: ${locationSummary}.`, 'ok');
  } catch (error) {
    setOrderFeedback(`No se pudo crear el pedido: ${error.message}`, 'error');
  }
}

async function createRestaurantOnboarding(event) {
  event.preventDefault();

  const nombre = String(ui.restaurantName?.value || "").trim();
  const responsable = String(ui.restaurantOwner?.value || "").trim();
  const telefono = String(ui.restaurantPhone?.value || "").trim();
  const whatsapp = String(ui.restaurantWhatsapp?.value || "").trim();
  const correo = String(ui.restaurantEmail?.value || "").trim();
  const horario = String(ui.restaurantHours?.value || "").trim();
  const direccion = String(ui.restaurantAddress?.value || "").trim();
  const lat = Number(ui.restaurantLat?.value);
  const lng = Number(ui.restaurantLng?.value);
  const comision = Number(ui.restaurantCommission?.value || 0);
  const zonaCobertura = String(ui.restaurantZone?.value || "").trim();
  const usuario = String(ui.restaurantUser?.value || "").trim();
  const estado = String(ui.restaurantState?.value || "En revision").trim();
  const menu = String(ui.restaurantMenu?.value || "").split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
  const notas = String(ui.restaurantNotes?.value || "").trim();

  if (!nombre || !responsable || !telefono || !whatsapp || !horario || !direccion || !zonaCobertura || !usuario) {
    setRestaurantFeedback("Completa nombre, responsable, telefono, WhatsApp, horario, direccion, zona y usuario.", "error");
    return;
  }

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    setRestaurantFeedback("Ingresa coordenadas validas.", "error");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Sesion no activa");
    }

    const idToken = await user.getIdToken();
    const response = await fetch(`${ADMIN_API_ENDPOINT}/api/admin/restaurantes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({
        nombre_comercial: nombre,
        responsable,
        telefono,
        whatsapp,
        correo,
        direccion,
        coordenadas: { lat, lng },
        horario,
        comision,
        zona_cobertura: zonaCobertura,
        usuario,
        estado,
        menu,
        notas
      })
    });

    const payload = await response.json().catch(() => ({}));
    if (!response.ok || !payload?.ok) {
      throw new Error(payload?.error || "No se pudo crear el restaurante");
    }

    ui.restaurantForm.reset();
    if (ui.restaurantState) {
      ui.restaurantState.value = "En revision";
    }
    setRestaurantFeedback(`Restaurante ${payload?.id || nombre} registrado en alta controlada.`, "ok");
    await refreshRestaurantList();
  } catch (error) {
    setRestaurantFeedback(`No se pudo guardar el alta: ${error.message}`, "error");
  }
}

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  setLoginError("");

  const email = String(ui.loginEmail.value || "").trim().toLowerCase();
  const password = String(ui.loginPassword.value || "");

  if (!isAuthorizedEmail(email)) {
    setLoginError("Correo no autorizado para el panel administrativo.");
    return;
  }

  try {
    await signInWithEmailAndPassword(auth, email, password);
  } catch (error) {
    setLoginError(`No fue posible iniciar sesion: ${error.message}`);
  }
});

ui.btnLogout.addEventListener("click", async () => {
  await signOut(auth);
});

[ui.orderSubtotal, ui.orderShipping, ui.orderTip].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', updateOrderTotalValue);
});

[ui.orderClient, ui.orderAddress, ui.orderPlaceType, ui.orderDeliveryMethod, ui.orderReference, ui.orderLocationNotes, ui.orderPaymentMethod].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', renderOrderPreview);
  input.addEventListener('change', renderOrderPreview);
});

if (ui.orderItems) {
  ui.orderItems.addEventListener('input', () => {
    sincronizarMontosAutomaticos();
    renderOrderPreview();
  });
  ui.orderItems.addEventListener('change', () => {
    sincronizarMontosAutomaticos();
    renderOrderPreview();
  });
}

[ui.orderClient, ui.orderPhone, ui.orderAddress, ui.orderPlaceType, ui.orderDeliveryMethod, ui.orderReference, ui.orderLocationNotes, ui.orderClientLat, ui.orderClientLng, ui.orderStoreLat, ui.orderStoreLng, ui.orderItems, ui.orderSubtotal, ui.orderShipping, ui.orderTip, ui.orderPaymentMethod].forEach((input) => {
  if (!input) return;
  input.addEventListener('input', updateOrderValidationState);
  input.addEventListener('change', updateOrderValidationState);
});

ui.orderForm.addEventListener("submit", createManualOrder);
if (ui.restaurantForm) {
  ui.restaurantForm.addEventListener("submit", createRestaurantOnboarding);
}
if (ui.restaurantRefresh) {
  ui.restaurantRefresh.addEventListener("click", refreshRestaurantList);
}
if (ui.restaurantFilterAll) {
  ui.restaurantFilterAll.addEventListener("click", () => {
    restaurantFilterState = 'all';
    updateRestaurantFilterButtons();
    refreshRestaurantList();
  });
}
if (ui.restaurantFilterActive) {
  ui.restaurantFilterActive.addEventListener("click", () => {
    restaurantFilterState = 'active';
    updateRestaurantFilterButtons();
    refreshRestaurantList();
  });
}
if (ui.restaurantFilterPending) {
  ui.restaurantFilterPending.addEventListener("click", () => {
    restaurantFilterState = 'pending';
    updateRestaurantFilterButtons();
    refreshRestaurantList();
  });
}
if (ui.restaurantFilterSuspended) {
  ui.restaurantFilterSuspended.addEventListener("click", () => {
    restaurantFilterState = 'suspended';
    updateRestaurantFilterButtons();
    refreshRestaurantList();
  });
}

document.querySelectorAll("[data-gov-nav], [data-gov-link]").forEach((link) => {
  link.addEventListener("click", (event) => {
    const target = link.dataset.govNav || link.dataset.govLink;
    if (!target) return;
    event.preventDefault();
    setGovPage(target);
  });
});

window.addEventListener("hashchange", () => {
  setGovPage(window.location.hash || GOV_DEFAULT_PAGE, {
    updateHash: false,
    scroll: false
  });
});

if (ui.restaurantListBody) {
  ui.restaurantListBody.addEventListener("click", async (event) => {
    const button = event.target?.closest?.(".restaurant-mark-active-btn");
    if (!button || button.disabled) return;
    const restaurantId = String(button.dataset.restaurantId || '').trim();
    const restaurantName = String(button.dataset.restaurantName || 'restaurant').trim();
    if (!restaurantId) return;

    button.disabled = true;
    try {
      await updateRestaurantState(restaurantId, 'Activo');
      setRestaurantFeedback(`Restaurante ${restaurantName} marcado como activo.`, 'ok');
      await refreshRestaurantList();
    } catch (error) {
      setRestaurantFeedback(`No se pudo actualizar ${restaurantName}: ${error.message}`, 'error');
    } finally {
      button.disabled = false;
    }
  });
}

if (ui.locationSearchBtn) {
  ui.locationSearchBtn.addEventListener("click", async () => {
    const query = String(ui.locationSearch?.value || "").trim();
    if (!query) {
      setOrderFeedback("Escribe una direccion para buscar.", "error");
      return;
    }

    try {
      const result = await geocodeAddress(query);
      if (!result) {
        setOrderFeedback("No se encontro esa direccion.", "error");
        return;
      }
      setSelectedLocation({
        lat: result.lat,
        lng: result.lng,
        address: result.address,
        label: "Direccion encontrada"
      });
      updateMapMarker(result.lat, result.lng, 17);
      renderOrderPreview();
      setOrderFeedback("Direccion localizada y centrada en el mapa.", "ok");
    } catch (error) {
      setOrderFeedback(`No fue posible buscar la direccion: ${error.message}`, "error");
    }
  });
}

if (ui.locationSearch) {
  ui.locationSearch.addEventListener("keydown", async (event) => {
    if (event.key !== "Enter") return;
    event.preventDefault();
    ui.locationSearchBtn?.click();
  });
}

if (ui.targetClient) {
  ui.targetClient.addEventListener("click", () => {
    setActiveLocationTarget("client");
  });
}

if (ui.targetStore) {
  ui.targetStore.addEventListener("click", () => {
    setActiveLocationTarget("store");
  });
}

if (ui.useCurrentLocation) {
  ui.useCurrentLocation.addEventListener("click", () => {
    if (!navigator.geolocation) {
      setOrderFeedback("El navegador no soporta geolocalizacion.", "error");
      return;
    }

    navigator.geolocation.getCurrentPosition(async (position) => {
      const lat = Number(position.coords.latitude);
      const lng = Number(position.coords.longitude);
      updateMapMarker(lat, lng, 17);
      try {
        const address = await reverseGeocode(lat, lng);
        setSelectedLocation({
          lat,
          lng,
          address: address || "",
          label: "Ubicacion actual"
        });
      } catch (_error) {
        setSelectedLocation({ lat, lng, label: "Ubicacion actual" });
      }
      setOrderFeedback("Ubicacion actual aplicada al mapa.", "ok");
    }, () => {
      setOrderFeedback("No se pudo obtener la ubicacion actual.", "error");
    }, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 30000
    });
  });
}

if (ui.confirmLocation) {
  ui.confirmLocation.addEventListener("click", async () => {
    const labelConfirmado = activeLocationTarget === "client"
      ? "Ubicación del cliente confirmada"
      : "Ubicación de la tienda confirmada";
    const updated = syncLocationFromMapCenter(labelConfirmado);
    if (!updated && orderMapInstance) {
      await refreshLocationFromCenter("confirm");
      syncLocationFromMapCenter(labelConfirmado);
    }
    setOrderFeedback("Ubicación confirmada para el pedido.", "ok");
  });
}

if (ui.previewOpenMaps) {
  ui.previewOpenMaps.addEventListener("click", (event) => {
    const href = ui.previewOpenMaps?.href || "";
    if (!href || href === "#") {
      event.preventDefault();
      setOrderFeedback("Selecciona una ubicacion antes de abrir Maps.", "error");
      return;
    }
    event.preventDefault();
    window.open(href, "_blank", "noopener,noreferrer");
  });
}

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    activeAdminUser = null;
    dashboardListenersAttached = false;
    stopDashboardPolling();
    switchToLogin();
    return;
  }

  const email = String(user.email || "").toLowerCase();
  if (!isAuthorizedEmail(email)) {
    activeAdminUser = null;
    await signOut(auth);
    switchToLogin();
    setLoginError("Sesion cerrada: correo no autorizado.");
    return;
  }

  activeAdminUser = user;
  switchToDashboard(email);
  initOrderMap();
  setActiveLocationTarget("client");
  if (ui.orderShipping && !ui.orderShipping.value) {
    ui.orderShipping.value = "45.00";
  }
  setSelectedLocation({
    lat: locationState.client.lat,
    lng: locationState.client.lng,
    address: locationState.client.address || ui.orderAddress.value || "",
    label: "Listo para capturar ubicación"
  });
  sincronizarMontosAutomaticos();
  if (!dashboardListenersAttached) {
    startDashboardPolling();
    dashboardListenersAttached = true;
  }
  updateRestaurantFilterButtons();
  await refreshRestaurantList();
  renderOrderPreview();
  updateOrderValidationState();
});
