// --- MÉTRICAS DE RENTABILIDAD DIARIA ---
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
      : '<li class="text-slate-400 col-span-2">Sin entregas hoy</li>';
  } catch (error) {
    document.getElementById("metric-ventas-brutas").textContent = "$0.00";
    document.getElementById("metric-comisiones-nelly").textContent = "$0.00";
    document.getElementById("metric-conteo-entregas").textContent = "0";
    document.getElementById("metric-mapa-calor").innerHTML = '<li class="text-slate-400 col-span-2">No disponible</li>';
  }
}
import { auth, rtdb } from "./admin-firebase-config.js";
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import {
  onValue,
  push,
  ref,
  set,
  update
} from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";

const AUTHORIZED_ADMIN_EMAILS = new Set([
  "admin@nellydelivery.com",
  "operaciones@nellydelivery.com"
]);

// Permite cambiar el endpoint desde la consola para pruebas de nómina
window.setAdminApiEndpoint = function(url) {
  if (typeof url === 'string' && url.startsWith('http')) {
    ADMIN_API_ENDPOINTS[0] = url.replace(/\/+$/, '');
    console.log('[Nómina][Test] ADMIN_API_ENDPOINTS cambiado a:', ADMIN_API_ENDPOINTS[0]);
  } else {
    console.warn('URL inválida para ADMIN_API_ENDPOINTS');
  }
};

const ADMIN_API_ENDPOINTS = [
  "https://nelly-api-8lh1.onrender.com"
];
const ADMIN_API_TIMEOUT_MS = 15000;
console.log("ADMIN DASHBOARD VERSION 522db1b");

// Script de validación automática de nómina
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
    console.log('[Nómina][Test] Liquidaciones:', liquidaciones);
    // 2. Ejecutar pago
    const pago = await fetch(`${ADMIN_API_ENDPOINTS[0]}/api/panel/finanzas/registrar-pago-deuda`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${idToken}`
      },
      body: JSON.stringify({ uid, monto_pago: montoPago })
    }).then(r => r.json());
    console.log('[Nómina][Test] Resultado pago:', pago);
    // 3. Consultar liquidaciones nuevamente
    const liquidaciones2 = await fetch(`${ADMIN_API_ENDPOINTS[0]}/api/liquidaciones`, {
      headers: { Authorization: `Bearer ${idToken}` }
    }).then(r => r.json());
    console.log('[Nómina][Test] Liquidaciones tras pago:', liquidaciones2);
    alert('Validación de nómina completada. Revisa la consola para detalles.');
  } catch (e) {
    alert('Error en validación de nómina: ' + e.message);
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
  metricBlocked: document.getElementById("metric-blocked"),
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
  orderAmount: document.getElementById("order-amount"),
  orderDriverId: document.getElementById("order-driver-id"),
  orderNotes: document.getElementById("order-notes"),
  orderFeedback: document.getElementById("order-feedback")
};

let currentDrivers = {};
let activeDriversBasePath = "usuarios/repartidores";
let dashboardListenersAttached = false;
let dashboardPollingId = null;
let activeAdminUser = null;
let dashboardSyncInFlight = false;

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
  ui.metricBlocked.textContent = "0";
  ui.metricOrders.textContent = "0";
}

function setDriversTableMessage(message) {
  ui.tableBody.innerHTML = `<tr><td class="px-3 py-3 text-sm text-slate-400" colspan="4">${escapeHtml(message)}</td></tr>`;
}

function renderDriversTable(drivers) {
  const rows = Object.entries(drivers);
  ui.metricDrivers.textContent = String(rows.length);

  let blockedCount = 0;
  const html = rows
    .sort((a, b) => {
      const nameA = String(a[1]?.nombre || a[1]?.displayName || a[0]).toLowerCase();
      const nameB = String(b[1]?.nombre || b[1]?.displayName || b[0]).toLowerCase();
      return nameA.localeCompare(nameB);
    })
    .map(([uid, data]) => {
      const nombre = data?.nombre || data?.displayName || "Sin nombre";
      const nivel = normalizeLevel(data?.estatus?.nivel || data?.nivel);
      const deuda = Number(data?.finanzas?.deuda_actual || data?.deuda_actual || 0);
      const bloqueado = data?.estatus?.bloqueado_por_deuda === true || data?.bloqueado_por_deuda === true;
      const uidSafe = escapeHtml(uid);
      const nombreSafe = escapeHtml(nombre);
      if (bloqueado) {
        blockedCount += 1;
      }

      return `
        <tr class="border-b border-panel-line/80 hover:bg-slate-900/40">
          <td class="px-2 py-2 font-medium sm:px-3">${nombreSafe}</td>
          <td class="hidden px-3 py-2 text-xs text-slate-300 md:table-cell">${uidSafe}</td>
          <td class="px-2 py-2 sm:px-3">${nivel}</td>
          <td class="px-2 py-2 sm:px-3">$${money(deuda)}</td>
          <td class="px-2 py-2 sm:px-3">
            <label class="inline-flex cursor-pointer items-center gap-2">
              <input
                type="checkbox"
                data-uid="${uidSafe}"
                class="manual-block-toggle h-4 w-4 accent-panel-warn"
                ${bloqueado ? "checked" : ""}
              />
              <span class="text-xs ${bloqueado ? "text-red-300" : "text-emerald-300"}">${bloqueado ? "Bloqueado" : "Activo"}</span>
            </label>
          </td>
        </tr>
      `;
    })
    .join("");

  ui.metricBlocked.textContent = String(blockedCount);
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
    ui.metricBlocked.textContent = "0";
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

async function createManualOrder(event) {
  event.preventDefault();

  const client = String(ui.orderClient.value || "").trim();
  const phone = String(ui.orderPhone.value || "").trim();
  const address = String(ui.orderAddress.value || "").trim();
  const amount = Number(ui.orderAmount.value || 0);
  const driverId = String(ui.orderDriverId.value || "").trim();
  const notes = String(ui.orderNotes.value || "").trim();

  if (!client || !phone || !address || !Number.isFinite(amount) || amount <= 0) {
    setOrderFeedback("Completa nombre, telefono, direccion y monto valido.", "error");
    return;
  }

  try {
    const user = auth.currentUser;
    if (!user) {
      throw new Error("Sesion no activa");
    }

    const idToken = await user.getIdToken();
    let created = false;
    let pedidoId = null;

    for (const baseUrl of ADMIN_API_ENDPOINTS) {
      try {
        const response = await fetch(`${baseUrl}/api/admin/pedidos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${idToken}`
          },
          body: JSON.stringify({
            cliente_nombre: client,
            telefono: phone,
            direccion: address,
            monto: Number(amount.toFixed(2)),
            descripcion: notes || "Pedido telefonico"
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
      throw new Error("No se pudo crear pedido en backend");
    }

    ui.orderForm.reset();
    setOrderFeedback(`Pedido ${pedidoId || "manual"} creado correctamente.`, "ok");
  } catch (error) {
    setOrderFeedback(`No se pudo crear el pedido: ${error.message}`, "error");
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

ui.orderForm.addEventListener("submit", createManualOrder);

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
  if (!dashboardListenersAttached) {
    startDashboardPolling();
    dashboardListenersAttached = true;
  }
});
