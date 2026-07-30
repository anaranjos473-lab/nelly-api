import { auth } from "./admin-firebase-config.js";
import { onAuthStateChanged, signInWithEmailAndPassword, signOut } from "./local-auth.js";

const LOCAL_API_ENDPOINT = window.location?.origin || "http://127.0.0.1:3001";
const PROD_API_ENDPOINT = "https://nelly-api-8lh1.onrender.com";
const FINANCE_API_ENDPOINT = (() => {
  const configured = String(window.__NELLY_FINANCE_API_ENDPOINT__ || window.__NELLY_ADMIN_API_ENDPOINT__ || "").trim().replace(/\/+$/, "");
  if (configured) return configured;
  const host = String(window.location?.hostname || "").toLowerCase();
  if (host === "127.0.0.1" || host === "localhost" || host === "::1") {
    return LOCAL_API_ENDPOINT;
  }
  return PROD_API_ENDPOINT;
})();

const DATA_ACCESS_ENDPOINT = `${FINANCE_API_ENDPOINT}/api/data-architecture/data-access`;

const ui = {
  loginSection: document.getElementById("login-section"),
  appSection: document.getElementById("app-section"),
  loginForm: document.getElementById("login-form"),
  loginEmail: document.getElementById("login-email"),
  loginPassword: document.getElementById("login-password"),
  loginError: document.getElementById("login-error"),
  sessionEmail: document.getElementById("session-email"),
  btnLogout: document.getElementById("btn-logout"),
  btnRefresh: document.getElementById("btn-refresh"),
  metricTotalDebt: document.getElementById("metric-total-debt"),
  metricDriversDebt: document.getElementById("metric-drivers-debt"),
  metricDriversBlocked: document.getElementById("metric-drivers-blocked"),
  metricLiquidations: document.getElementById("metric-liquidations"),
  driversCount: document.getElementById("drivers-count"),
  driversTableBody: document.getElementById("drivers-table-body"),
  liquidationsList: document.getElementById("liquidations-list"),
  monthlySummaryList: document.getElementById("finance-monthly-summary"),
  annualSummaryList: document.getElementById("finance-annual-summary"),
  paymentForm: document.getElementById("payment-form"),
  driverUid: document.getElementById("driver-uid"),
  paymentAmount: document.getElementById("payment-amount"),
  paymentNote: document.getElementById("payment-note"),
  pilotResetConfirm: document.getElementById("pilot-reset-confirm"),
  btnPilotReset: document.getElementById("btn-pilot-reset"),
  btnDebtDebug: document.getElementById("btn-debt-debug"),
  paymentResult: document.getElementById("payment-result"),
  debugState: document.getElementById("debug-state"),
  debugOutput: document.getElementById("debug-output")
};

let currentDrivers = {};
let archiveEngineFinanceMeta = {
  source: 'fallback',
  contract_version: null,
  module: 'finance',
  generatedAt: null,
  error: null
};

function money(value) {
  const number = Number(value || 0);
  return number.toLocaleString("es-MX", { style: "currency", currency: "MXN" });
}

function escapeHtml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getDebt(driver = {}) {
  const financeDebt = Number(driver?.finanzas?.deuda_actual);
  if (Number.isFinite(financeDebt)) return financeDebt;
  const walletDebt = Number(driver?.billetera?.deuda_comision);
  return Number.isFinite(walletDebt) ? walletDebt : 0;
}

function getLimit(driver = {}) {
  const limit = Number(driver?.finanzas?.limite_deuda);
  return Number.isFinite(limit) ? limit : 0;
}

function isBlocked(driver = {}) {
  const debt = getDebt(driver);
  const limit = getLimit(driver);
  return Boolean(
    driver?.bloqueado_por_deuda === true ||
    driver?.estatus?.bloqueado_por_deuda === true ||
    driver?.perfil?.bloqueado_por_deuda === true ||
    driver?.estatus?.bloqueo_manual === true ||
    (limit > 0 && debt > limit)
  );
}

function driverName(driver = {}, uid = "") {
  return driver?.nombre || driver?.displayName || driver?.name || driver?.perfil?.nombre || uid || "Conductor";
}

function setResult(message, type = "") {
  ui.paymentResult.textContent = message;
  ui.paymentResult.classList.toggle("ok", type === "ok");
  ui.paymentResult.classList.toggle("error", type === "error");
}

function setDebug(payload, type = "processing") {
  ui.debugState.className = `wc-state wc-state-${type}`;
  ui.debugState.textContent = type === "error" ? "Error" : (payload?.resultado_accept_order || "Leido");
  ui.debugOutput.innerHTML = payload
    ? `<div class="wc-list">
        <div class="wc-row"><span>Deuda</span><strong>${money(payload.deuda_actual)}</strong></div>
        <div class="wc-row"><span>Limite</span><strong>${money(payload.limite_deuda)}</strong></div>
        <div class="wc-row"><span>Motivo</span><strong>${escapeHtml(payload.motivo || "Sin motivo")}</strong></div>
        <div class="wc-row"><span>Bloqueado</span><strong>${payload.bloqueado_por_deuda ? "Si" : "No"}</strong></div>
      </div>`
    : "Sin diagnostico aun.";
}

function setArchiveMeta(meta = {}) {
  archiveEngineFinanceMeta = {
    source: meta.source || 'fallback',
    contract_version: meta.contract_version || null,
    module: 'finance',
    generatedAt: meta.generatedAt || null,
    error: meta.error || null
  };
  window.__nellyArchiveEngineMeta = archiveEngineFinanceMeta;
}

function renderSummaryItem(label, details, meta) {
  return `<div class="wc-row"><span><strong>${escapeHtml(label)}</strong><br><small class="wc-muted">${escapeHtml(details)}</small></span><strong>${escapeHtml(meta)}</strong></div>`;
}

function renderNAEFinancialSummaries(payload = {}) {
  const monthly = Array.isArray(payload?.monthly_summary) ? payload.monthly_summary : [];
  const annual = Array.isArray(payload?.annual_summary) ? payload.annual_summary : [];

  if (ui.monthlySummaryList) {
    ui.monthlySummaryList.innerHTML = monthly.length
      ? monthly.slice(0, 6).map((item) => renderSummaryItem(
          String(item.period || 'Periodo'),
          `Pedidos: ${item.pedidos || 0} · Entregados: ${item.entregados || 0} · Cancelados: ${item.cancelados || 0}`,
          money(item.monto_total || 0)
        )).join("")
      : `<div class="wc-empty">Sin resumen mensual disponible.</div>`;
  }

  if (ui.annualSummaryList) {
    ui.annualSummaryList.innerHTML = annual.length
      ? annual.slice(0, 6).map((item) => renderSummaryItem(
          String(item.year || 'Año'),
          `Pedidos: ${item.pedidos || 0} · Entregados: ${item.entregados || 0} · Cancelados: ${item.cancelados || 0}`,
          money(item.monto_total || 0)
        )).join("")
      : `<div class="wc-empty">Sin resumen anual disponible.</div>`;
  }
}

async function getToken() {
  const user = auth.currentUser;
  if (!user) {
    throw new Error("Sesion no activa");
  }
  return user.getIdToken();
}

async function api(path, options = {}) {
  const token = await getToken();
  const response = await fetch(`${FINANCE_API_ENDPOINT}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`
    }
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload?.error || `HTTP ${response.status}`);
  }
  return payload;
}

function renderDrivers(drivers) {
  const rows = Object.entries(drivers || {}).sort((a, b) => driverName(a[1], a[0]).localeCompare(driverName(b[1], b[0])));
  const withDebt = rows.filter(([, driver]) => getDebt(driver) > 0);
  const blocked = rows.filter(([, driver]) => isBlocked(driver));
  const totalDebt = rows.reduce((total, [, driver]) => total + getDebt(driver), 0);

  ui.metricTotalDebt.textContent = money(totalDebt);
  ui.metricDriversDebt.textContent = String(withDebt.length);
  ui.metricDriversBlocked.textContent = String(blocked.length);
  ui.driversCount.textContent = `${rows.length} registros`;

  if (!rows.length) {
    ui.driversTableBody.innerHTML = `<tr><td colspan="6"><div class="wc-empty">Sin conductores registrados.</div></td></tr>`;
    return;
  }

  ui.driversTableBody.innerHTML = rows.map(([uid, driver]) => {
    const debt = getDebt(driver);
    const limit = getLimit(driver);
    const blockedNow = isBlocked(driver);
    const statusClass = blockedNow ? "finance-status-blocked" : "finance-status-ok";
    const statusText = blockedNow ? "Bloqueado" : "Elegible";
    return `<tr>
      <td><strong>${escapeHtml(driverName(driver, uid))}</strong></td>
      <td>${escapeHtml(uid)}</td>
      <td>${money(debt)}</td>
      <td>${money(limit)}</td>
      <td class="${statusClass}">${statusText}</td>
      <td><button class="wc-action-secondary js-select-driver" type="button" data-uid="${escapeHtml(uid)}">Seleccionar</button></td>
    </tr>`;
  }).join("");

  document.querySelectorAll(".js-select-driver").forEach((button) => {
    button.addEventListener("click", () => {
      const uid = button.dataset.uid || "";
      const driver = currentDrivers[uid] || {};
      ui.driverUid.value = uid;
      ui.paymentAmount.value = String(getDebt(driver).toFixed(2));
      setResult(`Conductor seleccionado: ${driverName(driver, uid)}. Deuda visible ${money(getDebt(driver))}.`);
    });
  });
}

function renderLiquidations(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  ui.metricLiquidations.textContent = String(payload?.total ?? items.length);

  if (!items.length) {
    ui.liquidationsList.innerHTML = `<div class="wc-empty">Sin liquidaciones registradas.</div>`;
    return;
  }

  ui.liquidationsList.innerHTML = items.slice(0, 8).map((item) => {
    const driver = item.repartidorUid || item.uid || item.conductorId || "Sin UID";
    const amount = item.monto || item.total || item.montoLiquidacion || 0;
    const status = item.estado || "PENDIENTE";
    return `<div class="wc-row">
      <span>
        <strong>${escapeHtml(status)}</strong><br>
        <small class="wc-muted">${escapeHtml(driver)}</small>
      </span>
      <strong>${money(amount)}</strong>
    </div>`;
  }).join("");
}

async function loadData() {
  ui.driversTableBody.innerHTML = `<tr><td colspan="6"><div class="wc-loading">Cargando conductores...</div></td></tr>`;
  ui.liquidationsList.innerHTML = `<div class="wc-loading">Cargando liquidaciones...</div>`;
  if (ui.monthlySummaryList) ui.monthlySummaryList.innerHTML = `<div class="wc-loading">Cargando resumen mensual...</div>`;
  if (ui.annualSummaryList) ui.annualSummaryList.innerHTML = `<div class="wc-loading">Cargando resumen anual...</div>`;

  const [driversPayload, liquidationsPayload, naePayload] = await Promise.all([
    api("/api/panel/finanzas/repartidores-deuda").catch(async () => api("/api/admin/repartidores")),
    api("/api/panel/finanzas/liquidaciones").catch(async () => api("/api/liquidaciones")),
    api("/api/data-architecture/data-access").catch(async () => api("/api/data-architecture/data-access"))
  ]);

  currentDrivers = driversPayload?.drivers || {};
  renderDrivers(currentDrivers);
  renderLiquidations(liquidationsPayload);
  renderNAEFinancialSummaries(naePayload);
  setArchiveMeta({
    source: 'archive-engine',
    contract_version: naePayload?.contract_version || 'v1',
    generatedAt: naePayload?.generatedAt || null
  });
}

async function diagnoseDebt() {
  const uid = ui.driverUid.value.trim();
  if (!uid) {
    setResult("Escribe o selecciona un UID antes de diagnosticar.", "error");
    return null;
  }

  const payload = await api(`/api/admin/debug/deuda/${encodeURIComponent(uid)}`);
  setDebug(payload, payload?.bloqueado_por_deuda ? "blocked" : "completed");
  return payload;
}

async function registerPayment({ origen = "panel", requirePilotConfirmation = false } = {}) {
  const uid = ui.driverUid.value.trim();
  const amount = Number(ui.paymentAmount.value);

  if (!uid || !Number.isFinite(amount) || amount <= 0) {
    setResult("UID y monto mayor a cero son requeridos.", "error");
    return;
  }

  if (requirePilotConfirmation && !ui.pilotResetConfirm.checked) {
    setResult("Marca la confirmacion antes de aplicar reinicio piloto.", "error");
    return;
  }

  const payload = await api("/api/panel/finanzas/registrar-pago-deuda", {
    method: "POST",
    body: JSON.stringify({
      uid,
      monto_pago: amount,
      origen
    })
  });

  setResult(`Aplicado correctamente. Deuda actual: ${money(payload.deudaActual)}. Bloqueado por deuda: ${payload.bloqueadoPorDeuda ? "si" : "no"}.`, "ok");
  await diagnoseDebt().catch(() => null);
  await loadData();
}

ui.loginForm.addEventListener("submit", async (event) => {
  event.preventDefault();
  ui.loginError.classList.add("hidden");
  try {
    await signInWithEmailAndPassword(auth, ui.loginEmail.value, ui.loginPassword.value);
  } catch (error) {
    ui.loginError.textContent = error.message || "No se pudo iniciar sesion";
    ui.loginError.classList.remove("hidden");
  }
});

ui.btnLogout.addEventListener("click", () => signOut(auth));
ui.btnRefresh.addEventListener("click", () => loadData().catch((error) => setResult(error.message, "error")));
ui.paymentForm.addEventListener("submit", (event) => {
  event.preventDefault();
  registerPayment({ origen: "panel" }).catch((error) => setResult(error.message, "error"));
});
ui.btnPilotReset.addEventListener("click", () => {
  const uid = ui.driverUid.value.trim();
  const driver = currentDrivers[uid] || {};
  const debt = getDebt(driver);
  if (debt > 0) {
    ui.paymentAmount.value = String(debt.toFixed(2));
  }
  registerPayment({ origen: "piloto", requirePilotConfirmation: true }).catch((error) => setResult(error.message, "error"));
});
ui.btnDebtDebug.addEventListener("click", () => diagnoseDebt().catch((error) => setResult(error.message, "error")));

onAuthStateChanged(auth, (user) => {
  const isLogged = Boolean(user);
  ui.loginSection.classList.toggle("hidden", isLogged);
  ui.appSection.classList.toggle("hidden", !isLogged);
  if (!isLogged) return;

  ui.sessionEmail.textContent = user.email || "Sesion activa";
  loadData().catch((error) => {
    ui.driversTableBody.innerHTML = `<tr><td colspan="6"><div class="wc-empty">No se pudo cargar Finanzas: ${escapeHtml(error.message)}</div></td></tr>`;
    ui.liquidationsList.innerHTML = `<div class="wc-empty">No se pudo cargar liquidaciones.</div>`;
    if (ui.monthlySummaryList) ui.monthlySummaryList.innerHTML = `<div class="wc-empty">No se pudo cargar el resumen mensual.</div>`;
    if (ui.annualSummaryList) ui.annualSummaryList.innerHTML = `<div class="wc-empty">No se pudo cargar el resumen anual.</div>`;
    setArchiveMeta({
      source: 'fallback',
      error: error.message
    });
    setResult(error.message, "error");
  });
});
