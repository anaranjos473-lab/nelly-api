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

export {
  buildArchiveEngineSnapshot,
  classifyOrderCycle,
  getOrderTimestamp,
  isSameMexicoCityDay,
  isSameMexicoCityMonth
};
