import { buildArchiveEngineSnapshot } from './archiveEngine.js';

function sanitizeFirebaseKey(value = '') {
  return String(value || '')
    .trim()
    .replace(/[.#$\/\[\]]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 768);
}

function buildDataAccessContract(orders = [], now = Date.now()) {
  const snapshot = buildArchiveEngineSnapshot(orders, now);
  const monthlyIndex = Array.isArray(snapshot.monthly_index) ? snapshot.monthly_index : [];
  const annualSummary = monthlyIndex.reduce((acc, item) => {
    const [year] = String(item?.period || '').split('-');
    if (!year) return acc;
    const current = acc[year] || {
      year: Number(year),
      pedidos: 0,
      entregados: 0,
      cancelados: 0,
      monto_total: 0
    };
    current.pedidos += Number(item?.pedidos || 0);
    current.entregados += Number(item?.entregados || 0);
    current.cancelados += Number(item?.cancelados || 0);
    current.monto_total += Number(item?.monto_total || 0);
    acc[year] = current;
    return acc;
  }, {});

  return {
    ok: true,
    generatedAt: new Date(now).toISOString(),
    getActiveOrders() {
      return snapshot.orders_active;
    },
    getTodayOrders() {
      return snapshot.orders_today;
    },
    getHistoricalOrders() {
      return snapshot.orders_history;
    },
    getMonthlySummary() {
      return monthlyIndex;
    },
    getAnnualSummary() {
      return Object.values(annualSummary).sort((a, b) => b.year - a.year);
    },
    getAuditIndex() {
      return {
        history_index: snapshot.orders_history.reduce((acc, order) => {
          const commerce = sanitizeFirebaseKey(order?.comercio?.nombre || order?.tienda?.nombre || order?.comercio_nombre || order?.tienda_nombre || '');
          const customer = sanitizeFirebaseKey(order?.cliente_nombre || order?.cliente?.nombre || order?.cliente || '');
          const driver = sanitizeFirebaseKey(order?.repartidor_nombre || order?.repartidor?.nombre || order?.repartidor_id || order?.driverUid || '');
          const payment = sanitizeFirebaseKey(order?.metodo_pago || order?.forma_pago || order?.pago?.metodo || order?.pago?.tipo || '');
          const incident = sanitizeFirebaseKey(order?.incidencia_tipo || order?.causa_raiz || order?.tipo_incidencia || '');
          if (commerce) acc.comercio[commerce] = (acc.comercio[commerce] || 0) + 1;
          if (customer) acc.cliente[customer] = (acc.cliente[customer] || 0) + 1;
          if (driver) acc.driver[driver] = (acc.driver[driver] || 0) + 1;
          if (payment) acc.forma_pago[payment] = (acc.forma_pago[payment] || 0) + 1;
          if (incident) acc.incidencia[incident] = (acc.incidencia[incident] || 0) + 1;
          return acc;
        }, {
          comercio: {},
          cliente: {},
          driver: {},
          forma_pago: {},
          incidencia: {}
        })
      };
    }
  };
}

export { buildDataAccessContract };
