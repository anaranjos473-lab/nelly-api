function createSyncState() {
  return {
    sincronizacionIniciada: false,
    pedidosListenerRef: null,
    pedidosListenerCallback: null,
    primeraCargaPendientes: true
  };
}

function createAuthState() {
  return {
    authRequestInFlight: false
  };
}

function createOrdersState() {
  return {
    pedidosPendientes: new Map(),
    pedidosReparto: new Map(),
    pedidosEnCamino: new Map(),
    pedidosEntregados: new Map()
  };
}

function createMetricsState() {
  return {
    metricasEventos: {
      total: 0,
      pendienteAdded: 0,
      pendienteChanged: 0,
      pendienteRemoved: 0,
      repartoSnapshot: 0,
      caminoSnapshot: 0,
      simulacionEventos: 0,
      renderSolicitudes: 0,
      renderEjecutados: 0,
      ultimoEvento: '-'
    },
    metricasInicioMs: Date.now(),
    metricasTickerId: null
  };
}

function createAlertsState() {
  return {
    notificacionesHabilitadas: false,
    alertaMinIntervalMs: 120000,
    alertaMinEventos: 20,
    alertasDebounceSilenciadas: false,
    ultimaAlertaDebounceMs: 0,
    liquidacionesAuditProcesadas: new Set()
  };
}

function createUiState() {
  return {
    renderDebounceTimer: null,
    RENDER_DEBOUNCE_MS: 90,
    ui: null,
    systemHealth: null,
    dashboard: null,
    panelActivo: null,
    pedidoSeleccionado: null,
    filtros: null
  };
}

function createKitchenState() {
  return {
    sync: createSyncState(),
    auth: createAuthState(),
    orders: createOrdersState(),
    metrics: createMetricsState(),
    alerts: createAlertsState(),
    ui: createUiState(),
    session: null,
    drivers: null,
    timeline: null,
    audit: null
  };
}

const kitchenState = createKitchenState();
const subscribers = new Set();

function notifySubscribers() {
  subscribers.forEach((listener) => {
    try {
      listener(kitchenState);
    } catch (_error) {
      // La notificacion no debe romper el estado compartido.
    }
  });
}

export function getKitchenState() {
  return kitchenState;
}

export function setKitchenState(partial = {}) {
  Object.entries(partial).forEach(([key, value]) => {
    if (key in kitchenState && value && typeof value === 'object' && !Array.isArray(value) && !(value instanceof Map) && !(value instanceof Set)) {
      kitchenState[key] = {
        ...(kitchenState[key] || {}),
        ...value
      };
      return;
    }

    kitchenState[key] = value;
  });

  notifySubscribers();
  return kitchenState;
}

export function subscribeKitchenState(listener) {
  if (typeof listener !== 'function') {
    return () => {};
  }

  subscribers.add(listener);
  listener(kitchenState);

  return () => {
    subscribers.delete(listener);
  };
}

export function unsubscribeKitchenState(listener) {
  subscribers.delete(listener);
  return kitchenState;
}

export function resetKitchenState() {
  const fresh = createKitchenState();

  Object.keys(kitchenState).forEach((key) => {
    delete kitchenState[key];
  });

  Object.assign(kitchenState, fresh);
  notifySubscribers();
  return kitchenState;
}
