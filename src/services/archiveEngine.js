function getOrderTimestamp(order = {}) {
  const candidate = order.createdAt
    || order.created_at
    || order.fecha_creacion
    || order.fecha_creado
    || order.timestamp
    || order.timestampCreacion
    || order.timestamp_creacion
    || order.fecha;
  if (candidate === null || candidate === undefined || candidate === '') return Date.now();
  if (typeof candidate === 'number' && Number.isFinite(candidate)) {
    return candidate < 1e12 ? candidate * 1000 : candidate;
  }
  const parsed = Date.parse(candidate);
  if (Number.isFinite(parsed)) return parsed;
  const numeric = Number(candidate);
  if (Number.isFinite(numeric) && numeric > 0) {
    return numeric < 1e12 ? numeric * 1000 : numeric;
  }
  return Date.now();
}

function getMexicoCityDateParts(timestamp = Date.now()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(new Date(timestamp));
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(lookup.year || 0),
    month: Number(lookup.month || 0),
    day: Number(lookup.day || 0)
  };
}

function isSameMexicoCityDay(aTimestamp, bTimestamp) {
  const a = getMexicoCityDateParts(aTimestamp);
  const b = getMexicoCityDateParts(bTimestamp);
  return a.year === b.year && a.month === b.month && a.day === b.day;
}

function isSameMexicoCityMonth(aTimestamp, bTimestamp) {
  const a = getMexicoCityDateParts(aTimestamp);
  const b = getMexicoCityDateParts(bTimestamp);
  return a.year === b.year && a.month === b.month;
}

function normalizeState(state = '') {
  return String(state || '').trim().toUpperCase();
}

function sanitizeFirebaseKey(value = '') {
  return String(value || '')
    .trim()
    .replace(/[.#$\/\[\]]/g, '_')
    .replace(/\s+/g, ' ')
    .slice(0, 768);
}

function classifyOrderCycle(order = {}, now = Date.now()) {
  const createdAt = getOrderTimestamp(order);
  const state = normalizeState(order.estado_pedido || order.estado);
  const deliveredAt = Number(order.entregado_en || order.entregadoEn || 0);
  const deliveredToday = deliveredAt > 0 && isSameMexicoCityDay(deliveredAt, now);
  const createdToday = isSameMexicoCityDay(createdAt, now);
  const inCurrentMonth = isSameMexicoCityMonth(createdAt, now) || (deliveredAt > 0 && isSameMexicoCityMonth(deliveredAt, now));
  const isDelivered = state === 'ENTREGADO' || state === 'FINALIZADO' || Boolean(deliveredAt);

  let bucket = 'history';
  if (createdToday && !isDelivered) {
    bucket = 'active';
  } else if (createdToday && isDelivered) {
    bucket = 'today';
  } else if (inCurrentMonth) {
    bucket = isDelivered ? 'history' : 'active';
  }

  return {
    bucket,
    createdAt,
    createdToday,
    deliveredToday,
    inCurrentMonth,
    isDelivered,
    state
  };
}

function sortDescendingByTimestamp(a = {}, b = {}) {
  return getOrderTimestamp(b) - getOrderTimestamp(a);
}

function buildMonthlyIndex(orders = []) {
  const index = new Map();

  orders.forEach((order) => {
    const ts = getOrderTimestamp(order);
    const parts = getMexicoCityDateParts(ts);
    if (!parts.year || !parts.month) return;
    const key = `${parts.year}-${String(parts.month).padStart(2, '0')}`;
    const current = index.get(key) || {
      period: key,
      pedidos: 0,
      entregados: 0,
      cancelados: 0,
      monto_total: 0
    };
    const state = normalizeState(order.estado_pedido || order.estado);
    current.pedidos += 1;
    if (state === 'ENTREGADO' || state === 'FINALIZADO') current.entregados += 1;
    if (state === 'CANCELADO') current.cancelados += 1;
    current.monto_total += Number(order.monto || order.total || order.monto_total || 0) || 0;
    index.set(key, current);
  });

  return [...index.values()].sort((a, b) => String(b.period).localeCompare(String(a.period)));
}

function buildArchiveEngineSnapshot(orders = [], now = Date.now()) {
  const normalized = Array.isArray(orders)
    ? orders.filter((order) => order && typeof order === 'object').map((order) => ({ ...order }))
    : [];

  const classified = normalized.map((order) => ({
    ...order,
    archive_bucket: classifyOrderCycle(order, now).bucket
  }));

  const activeOrders = classified.filter((order) => order.archive_bucket === 'active').sort(sortDescendingByTimestamp);
  const todayOrders = classified.filter((order) => order.archive_bucket === 'today').sort(sortDescendingByTimestamp);
  const historyOrders = classified.filter((order) => order.archive_bucket === 'history').sort(sortDescendingByTimestamp);

  return {
    ok: true,
    generatedAt: new Date(now).toISOString(),
    summary: {
      total: classified.length,
      active: activeOrders.length,
      today: todayOrders.length,
      history: historyOrders.length,
      monthly_index: buildMonthlyIndex(classified).length
    },
    orders_active: activeOrders,
    orders_today: todayOrders,
    orders_history: historyOrders,
    monthly_index: buildMonthlyIndex(classified)
  };
}

function buildArchiveEngineUpdates(orders = [], now = Date.now()) {
  const snapshot = buildArchiveEngineSnapshot(orders, now);
  const dateParts = getMexicoCityDateParts(now);
  const dateKey = `${dateParts.year}-${String(dateParts.month).padStart(2, '0')}-${String(dateParts.day).padStart(2, '0')}`;
  const monthKey = `${dateParts.year}-${String(dateParts.month).padStart(2, '0')}`;
  const yearKey = String(dateParts.year);
  const dailyHistory = snapshot.orders_today;
  const combinedHistory = [...snapshot.orders_history, ...snapshot.orders_today];

  const historyIndex = {
    comercio: {},
    cliente: {},
    driver: {},
    forma_pago: {},
    incidencia: {},
    fecha: {}
  };

  const byMonth = combinedHistory.reduce((acc, order) => {
    const parts = getMexicoCityDateParts(getOrderTimestamp(order));
    const key = `${parts.year}-${String(parts.month).padStart(2, '0')}`;
    if (!acc[key]) {
      acc[key] = {
        period: key,
        pedidos: 0,
        entregados: 0,
        cancelados: 0,
        monto_total: 0
      };
    }
    acc[key].pedidos += 1;
    const state = normalizeState(order.estado_pedido || order.estado);
    if (state === 'ENTREGADO' || state === 'FINALIZADO') acc[key].entregados += 1;
    if (state === 'CANCELADO') acc[key].cancelados += 1;
    acc[key].monto_total += Number(order.monto || order.total || order.monto_total || 0) || 0;
    return acc;
  }, {});

  const annualSummary = combinedHistory.reduce((acc, order) => {
    const state = normalizeState(order.estado_pedido || order.estado);
    const amount = Number(order.monto || order.total || order.monto_total || 0) || 0;
    acc.pedidos += 1;
    acc.monto_total += amount;
    if (state === 'ENTREGADO' || state === 'FINALIZADO') acc.entregados += 1;
    if (state === 'CANCELADO') acc.cancelados += 1;
    return acc;
  }, {
    year: dateParts.year,
    pedidos: 0,
    entregados: 0,
    cancelados: 0,
    monto_total: 0,
    actualizada_en: new Date(now).toISOString()
  });

  const groupBy = (items, keyFn, target) => {
    items.forEach((order) => {
      const key = sanitizeFirebaseKey(keyFn(order));
      if (!key) return;
      target[key] = target[key] || { key, pedidos: 0 };
      target[key].pedidos += 1;
    });
  };

  groupBy(combinedHistory, (order) => order.comercio?.nombre || order.tienda?.nombre || order.comercio_nombre || order.tienda_nombre, historyIndex.comercio);
  groupBy(combinedHistory, (order) => order.cliente_nombre || order.cliente?.nombre || order.cliente, historyIndex.cliente);
  groupBy(combinedHistory, (order) => order.repartidor_nombre || order.repartidor?.nombre || order.repartidor_id || order.driverUid, historyIndex.driver);
  groupBy(combinedHistory, (order) => order.metodo_pago || order.forma_pago || order.pago?.metodo || order.pago?.tipo, historyIndex.forma_pago);
  groupBy(combinedHistory, (order) => order.incidencia_tipo || order.causa_raiz || order.tipo_incidencia, historyIndex.incidencia);
  groupBy(combinedHistory, (order) => `${getMexicoCityDateParts(getOrderTimestamp(order)).year}-${String(getMexicoCityDateParts(getOrderTimestamp(order)).month).padStart(2, '0')}-${String(getMexicoCityDateParts(getOrderTimestamp(order)).day).padStart(2, '0')}`, historyIndex.fecha);

  return {
    [`archive_engine/orders_active`]: snapshot.orders_active,
    [`archive_engine/orders_today`]: snapshot.orders_today,
    [`archive_engine/orders_history/${dateKey}`]: dailyHistory,
    [`archive_engine/monthly_index/${monthKey}`]: snapshot.monthly_index,
    [`archive_engine/annual_summary/${yearKey}`]: annualSummary,
    [`archive_engine/history_index/${yearKey}`]: historyIndex
  };
}

export {
  buildArchiveEngineSnapshot,
  buildArchiveEngineUpdates,
  classifyOrderCycle,
  getOrderTimestamp,
  isSameMexicoCityDay,
  isSameMexicoCityMonth
};
