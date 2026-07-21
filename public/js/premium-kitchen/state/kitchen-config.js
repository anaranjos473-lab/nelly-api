const kitchenConfig = Object.freeze({
  render: Object.freeze({
    debounceMs: 90
  }),
  metrics: Object.freeze({
    refreshMs: 10000,
    eficienciaMinimaPct: 35
  }),
  alerts: Object.freeze({
    minIntervalMs: 120000,
    minEventos: 20
  }),
  auth: Object.freeze({
    bootstrapFallbackEnabled: true
  })
});

export function getKitchenConfig() {
  return kitchenConfig;
}

export function getRenderConfig() {
  return kitchenConfig.render;
}

export function getMetricsConfig() {
  return kitchenConfig.metrics;
}

export function getAlertsConfig() {
  return kitchenConfig.alerts;
}

export function getAuthConfig() {
  return kitchenConfig.auth;
}
