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
import { auth, rtdb } from "./admin-firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "./local-auth.js";
import {
  onValue,
  push,
  ref,
  set,
  update
} from "./local-auth.js";

const AUTHORIZED_ADMIN_EMAILS = new Set([
  "admin@nellydelivery.com",
  "operaciones@nellydelivery.com"
]);

// Permite cambiar el endpoint desde la consola para pruebas de nomina
window.setAdminApiEndpoint = function(url) {
  if (typeof url === 'string' && url.startsWith('http')) {
    ADMIN_API_ENDPOINTS[0] = url.replace(/\/+$/, '');
    console.log('[Nomina][Test] ADMIN_API_ENDPOINTS cambiado a:', ADMIN_API_ENDPOINTS[0]);
  } else {
    console.warn('URL invalida para ADMIN_API_ENDPOINTS');
  }
};

const LOCAL_ADMIN_API_ENDPOINT = window.location?.origin || "http://127.0.0.1:3001";
const ADMIN_API_ENDPOINTS = [
  LOCAL_ADMIN_API_ENDPOINT,
  "https://nelly-api-8lh1.onrender.com"
];
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
    const liquidaciones = await fetch(`${ADMIN_API_ENDPOINTS[0]}/api/liquidaciones`, {
      headers: { Authorization: `Bearer ${idToken}` }
    }).then(r => r.json());
    console.log('[Nomina][Test] Liquidaciones:', liquidaciones);
    // 2. Ejecutar pago
    const pago = await fetch(`${ADMIN_API_ENDPOINTS[0]}/api/panel/finanzas/registrar-pago-deuda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid, monto_pago: montoPago })
    }).then(r => r.json());
    console.log('[Nomina][Test] Resultado pago:', pago);
    // 3. Consultar liquidaciones nuevamente
    const liquidaciones2 = await fetch(`${ADMIN_API_ENDPOINTS[0]}/api/liquidaciones`, {
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
  orderFeedback: document.getElementById("order-feedback")
};

let currentDrivers = {};
let activeDriversBasePath = "usuarios/repartidores";
let dashboardListenersAttached = false;
let dashboardPollingId = null;
let activeAdminUser = null;
let dashboardSyncInFlight = false;
let orderMapInstance = null;
let orderMapReady = false;
let orderMapMarker = null;
let reverseLookupInFlight = false;
let activeLocationTarget = "client";
let locationState = {
  client: { lat: 16.75, lng: -93.12, address: "", label: "" },
  store: { lat: 16.7527, lng: -93.1134, address: "", label: "" }
};

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
  orderMapInstance.setView([lat, lng], zoom, { animate: true });
  if (!orderMapMarker) {
    orderMapMarker = L.marker([lat, lng], { draggable: false }).addTo(orderMapInstance);
  } else {
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
  if (orderMapReady || !ui.orderMap || typeof window.L === "undefined") return;

  orderMapInstance = L.map(ui.orderMap, {
    zoomControl: true,
    scrollWheelZoom: true
  }).setView([getActiveLocation().lat, getActiveLocation().lng], 17);

  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19,
    attribution: "&copy; OpenStreetMap contributors"
  }).addTo(orderMapInstance);

  orderMapInstance.on("moveend", () => {
    refreshLocationFromCenter("moveend");
  });

  orderMapReady = true;
  updateMapMarker(getActiveLocation().lat, getActiveLocation().lng, 17);
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

function switchToDashboard(email) {
  ui.loginSection.classList.add("hidden");
  ui.dashboardSection.classList.remove("hidden");
  ui.sessionBox.classList.remove("hidden");
  ui.sessionBox.classList.add("flex");
  ui.sessionEmail.textContent = email;
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
  ui.tableBody.innerHTML = html || "<tr><td class=\"px-3 py-3 text-sm text-slate-400\" colspan=\"5\">Sin repartidores registrados.</td></tr>";
}

function bindToggleEvents() {
  const toggles = document.querySelectorAll(".manual-block-toggle");
  toggles.forEach((toggle) => {
    toggle.addEventListener("change", async (event) => {
      const target = event.target;
      const uid = target.dataset.uid;
      const nextValue = target.checked;

      try {
        await update(ref(rtdb, `${activeDriversBasePath}/${uid}`), {
          bloqueado_por_deuda: nextValue,
          "estatus/bloqueado_por_deuda": nextValue,
          "perfil/bloqueado_por_deuda": nextValue,
          "estatus/bloqueo_manual": nextValue,
          "estatus/updated_at": Date.now()
        });
      } catch (error) {
        try {
          const user = auth.currentUser;
          if (!user) {
            throw new Error("Sesion no activa");
          }

          const idToken = await user.getIdToken();
          let success = false;

          for (const baseUrl of ADMIN_API_ENDPOINTS) {
            try {
              const response = await fetch(`${baseUrl}/api/admin/repartidores/manual-lock`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${idToken}`
                },
                body: JSON.stringify({ uid, bloqueado: nextValue })
              });

              if (response.ok) {
                success = true;
                break;
              }
            } catch (_networkError) {}
          }

          if (!success) {
            throw new Error("Sin respuesta valida del backend");
          }

          syncDashboardData();
        } catch (fallbackError) {
          target.checked = !nextValue;
          window.alert(`No se pudo actualizar bloqueo manual: ${fallbackError.message}`);
        }
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
  let lastError = new Error("Sin respuesta valida del backend");

  for (const baseUrl of ADMIN_API_ENDPOINTS) {
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), ADMIN_API_TIMEOUT_MS);

    try {
      const response = await fetch(`${baseUrl}${path}`, {
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
      lastError = error?.name === "AbortError"
        ? new Error(`Timeout consultando ${path}`)
        : error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  throw lastError;
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
    document.getElementById("metric-mapa-calor").innerHTML = '<li class="text-slate-400 col-span-2">No disponible</li>';
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

    for (const baseUrl of ADMIN_API_ENDPOINTS) {
      try {
        const response = await fetch(`${baseUrl}/api/admin/pedidos`, {
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

        if (response.ok) {
          const payload = await response.json();
          pedidoId = payload?.id || null;
          created = true;
          break;
        }
      } catch (_networkError) {}
    }

    if (!created) {
      throw new Error('No se pudo crear pedido en backend');
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
  renderOrderPreview();
  updateOrderValidationState();
});
