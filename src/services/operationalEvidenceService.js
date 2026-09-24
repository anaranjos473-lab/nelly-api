import { createHash } from 'node:crypto';

const SAFE_ID = /^[A-Za-z0-9_-]{1,120}$/;

export const WORK_EVENT_TYPES = new Set([
  'CONNECTED',
  'AVAILABLE',
  'OFFER_RECEIVED',
  'OFFER_ACCEPTED',
  'ARRIVED_MERCHANT',
  'WAIT_STARTED',
  'ORDER_READY',
  'PICKUP',
  'ARRIVED_DROPOFF',
  'DELIVERED',
  'CANCELLED',
  'DISCONNECTED'
]);

export const REVIEW_OUTCOMES = new Set([
  'RECEIVED',
  'NEEDS_INFORMATION',
  'CLOSED_NO_ACTION'
]);

export function requireSafeId(value, field) {
  const normalized = String(value || '').trim();
  if (!SAFE_ID.test(normalized)) {
    const error = new Error(`${field} invalido`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

export function requireString(value, field, maxLength = 500) {
  const normalized = String(value || '').trim();
  if (!normalized || normalized.length > maxLength) {
    const error = new Error(`${field} invalido`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
}

export function requireTimestamp(value, field) {
  const timestamp = Number(value);
  if (!Number.isSafeInteger(timestamp) || timestamp <= 0) {
    const error = new Error(`${field} debe ser un timestamp valido`);
    error.statusCode = 400;
    throw error;
  }
  return timestamp;
}

export function isPrivilegedUser(user = {}) {
  return user.admin === true || user.panel === true || user.role === 'panel_cocina';
}

export function createImmutableEvent({ id, type, actorId, occurredAt, recordedAt, references = {}, metadata = {} }) {
  return Object.freeze({
    event_id: id,
    event_type: type,
    actor_id: actorId,
    occurred_at: occurredAt,
    recorded_at: recordedAt,
    references: Object.freeze({ ...references }),
    metadata: Object.freeze({ ...metadata })
  });
}

function stableSerialize(value) {
  if (Array.isArray(value)) return `[${value.map(stableSerialize).join(',')}]`;
  if (value && typeof value === 'object') {
    return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stableSerialize(value[key])}`).join(',')}}`;
  }
  return JSON.stringify(value);
}

export function createIdempotencyFingerprint(value) {
  return createHash('sha256').update(stableSerialize(value)).digest('hex');
}

export function summarizeWorkEvents(events = {}) {
  const values = Object.values(events).sort((left, right) => left.occurred_at - right.occurred_at);
  const totals = {
    event_count: values.length,
    connected_minutes: 0,
    available_minutes: 0,
    waiting_minutes: 0,
    effective_work_minutes: 0
  };

  let connectedAt = null;
  let availableAt = null;
  let waitingAt = null;
  let acceptedAt = null;

  for (const event of values) {
    const at = event.occurred_at;
    if (event.event_type === 'CONNECTED') connectedAt = at;
    if (event.event_type === 'AVAILABLE') availableAt = at;
    if (event.event_type === 'WAIT_STARTED') waitingAt = at;
    if (event.event_type === 'OFFER_ACCEPTED') acceptedAt = at;

    if (event.event_type === 'DISCONNECTED' && connectedAt) {
      totals.connected_minutes += Math.max(0, Math.round((at - connectedAt) / 60000));
      connectedAt = null;
    }
    if (event.event_type === 'OFFER_ACCEPTED' && availableAt) {
      totals.available_minutes += Math.max(0, Math.round((at - availableAt) / 60000));
      availableAt = null;
    }
    if (event.event_type === 'ORDER_READY' && waitingAt) {
      totals.waiting_minutes += Math.max(0, Math.round((at - waitingAt) / 60000));
      waitingAt = null;
    }
    if (event.event_type === 'DELIVERED' && acceptedAt) {
      totals.effective_work_minutes += Math.max(0, Math.round((at - acceptedAt) / 60000));
      acceptedAt = null;
    }
  }

  return { ...totals, derived_at: Date.now() };
}

function sortedEvents(events = {}) {
  return Object.values(events)
    .filter((event) => event && typeof event === 'object')
    .sort((left, right) => Number(left.occurred_at || 0) - Number(right.occurred_at || 0));
}

function roundRatio(numerator, denominator) {
  if (!denominator) return 0;
  return Math.round((numerator / denominator) * 10000) / 10000;
}

export function summarizeDriverProductivity(events = {}) {
  const values = sortedEvents(events);
  const workSummary = summarizeWorkEvents(events);
  const counts = values.reduce((accumulator, event) => {
    accumulator[event.event_type] = (accumulator[event.event_type] || 0) + 1;
    return accumulator;
  }, {});
  const deliveredOrderIds = new Set(
    values
      .filter((event) => event.event_type === 'DELIVERED')
      .map((event) => event.references?.order_id)
      .filter(Boolean)
  );

  return {
    ...workSummary,
    accepted_offers: counts.OFFER_ACCEPTED || 0,
    delivered_orders: deliveredOrderIds.size,
    cancelled_events: counts.CANCELLED || 0,
    delivery_completion_rate: roundRatio(deliveredOrderIds.size, counts.OFFER_ACCEPTED || 0),
    observed_orders_per_hour: roundRatio(deliveredOrderIds.size * 60, workSummary.effective_work_minutes),
    metric_scope: 'OBSERVED_WORK_EVENTS_ONLY'
  };
}

function normalizeOrderState(order = {}) {
  return String(order.estado_pedido || order.estado || order.logistica?.estado || '').trim().toUpperCase();
}

function resolveMerchantId(order = {}) {
  return String(
    order.comercio_id
    || order.tienda_id
    || order.merchant_id
    || order.restaurant_id
    || order.id_comercio
    || ''
  ).trim();
}

export function summarizeMerchantPerformance(orders = {}, merchantId) {
  const matchingOrders = Object.values(orders).filter((order) => resolveMerchantId(order) === merchantId);
  const totals = matchingOrders.reduce((accumulator, order) => {
    const state = normalizeOrderState(order);
    accumulator.orders_total += 1;
    if (state === 'ENTREGADO' || state === 'FINALIZADO') accumulator.orders_delivered += 1;
    else if (state === 'CANCELADO') accumulator.orders_cancelled += 1;
    else accumulator.orders_open += 1;
    return accumulator;
  }, { orders_total: 0, orders_delivered: 0, orders_cancelled: 0, orders_open: 0 });

  return {
    ...totals,
    delivery_completion_rate: roundRatio(totals.orders_delivered, totals.orders_total),
    metric_scope: 'ORDER_OUTCOMES_ONLY',
    derived_at: Date.now()
  };
}

export function simulateDriverOperationalMode(events = {}) {
  const latest = sortedEvents(events).at(-1) || null;
  const modeByEvent = {
    DISCONNECTED: 'OFFLINE',
    CONNECTED: 'CONNECTED',
    AVAILABLE: 'AVAILABLE',
    OFFER_RECEIVED: 'OFFER_PENDING',
    OFFER_ACCEPTED: 'ON_TASK',
    ARRIVED_MERCHANT: 'ON_TASK',
    WAIT_STARTED: 'WAITING_AT_MERCHANT',
    ORDER_READY: 'ON_TASK',
    PICKUP: 'ON_DELIVERY',
    DELIVERED: 'AVAILABLE',
    CANCELLED: 'AVAILABLE'
  };

  return {
    mode: 'CALCULATION_ONLY',
    simulated_operational_mode: latest ? modeByEvent[latest.event_type] || 'UNKNOWN' : 'NO_EVIDENCE',
    source_event_id: latest?.event_id || null,
    source_event_type: latest?.event_type || null,
    source_occurred_at: latest?.occurred_at || null,
    writes_performed: false,
    effects: [],
    derived_at: Date.now()
  };
}

export function buildWorkTimeEvidence(events = {}) {
  const tasks = new Map();
  for (const event of sortedEvents(events)) {
    const orderId = event.references?.order_id;
    if (!orderId) continue;
    const task = tasks.get(orderId) || {
      order_id: orderId,
      accepted_at: null,
      arrived_pickup_at: null,
      picked_up_at: null,
      arrived_dropoff_at: null,
      completed_at: null,
      cancelled_at: null
    };
    if (event.event_type === 'OFFER_ACCEPTED' && task.accepted_at === null) task.accepted_at = event.occurred_at;
    if (event.event_type === 'ARRIVED_MERCHANT' && task.arrived_pickup_at === null) task.arrived_pickup_at = event.occurred_at;
    if (event.event_type === 'PICKUP' && task.picked_up_at === null) task.picked_up_at = event.occurred_at;
    if (event.event_type === 'ARRIVED_DROPOFF' && task.arrived_dropoff_at === null) task.arrived_dropoff_at = event.occurred_at;
    if (event.event_type === 'DELIVERED') task.completed_at = event.occurred_at;
    if (event.event_type === 'CANCELLED') task.cancelled_at = event.occurred_at;
    tasks.set(orderId, task);
  }

  return [...tasks.values()].map((task) => ({
    ...task,
    effective_work_seconds_observed: task.accepted_at && task.completed_at
      ? Math.max(0, Math.round((task.completed_at - task.accepted_at) / 1000))
      : null
  }));
}

export function buildRouteEvidence(events = {}) {
  const routes = new Map();
  for (const event of sortedEvents(events)) {
    const routeId = event.references?.route_id;
    if (!routeId) continue;
    const route = routes.get(routeId) || {
      route_id: routeId,
      order_ids: new Set(),
      first_observed_at: event.occurred_at,
      last_observed_at: event.occurred_at,
      observed_distance_meters: null,
      estimated_eta_seconds: null,
      h3_zone: null,
      route_continuity_observed: false,
      completion_events: []
    };
    const orderId = event.references?.order_id;
    if (orderId) route.order_ids.add(orderId);
    route.last_observed_at = event.occurred_at;
    if (Number.isSafeInteger(event.metadata?.observed_distance_meters)) {
      route.observed_distance_meters = event.metadata.observed_distance_meters;
    }
    if (Number.isSafeInteger(event.metadata?.estimated_eta_seconds)) {
      route.estimated_eta_seconds = event.metadata.estimated_eta_seconds;
    }
    if (event.metadata?.h3_zone) route.h3_zone = event.metadata.h3_zone;
    if (event.metadata?.route_continuity === true) route.route_continuity_observed = true;
    if (['DELIVERED', 'CANCELLED'].includes(event.event_type) && orderId) {
      route.completion_events.push({ order_id: orderId, event_type: event.event_type, occurred_at: event.occurred_at });
    }
    routes.set(routeId, route);
  }

  return [...routes.values()].map((route) => ({
    ...route,
    order_ids: [...route.order_ids].sort(),
    route_order_count: route.order_ids.size,
    metric_scope: 'OBSERVED_ROUTE_EVIDENCE_ONLY'
  }));
}

export function buildComplianceReadiness({ driverId, events = {}, dispatchDecisions = {}, reviews = {} }) {
  const decisionValues = Object.values(dispatchDecisions).flatMap((value) => (
    value?.event_id ? [value] : Object.values(value || {})
  ));
  const visibleDecisions = decisionValues
    .filter((decision) => decision?.metadata?.candidate_driver_ids?.includes(driverId))
    .map((decision) => ({
      decision_id: decision.event_id,
      occurred_at: decision.occurred_at,
      algorithm_id: decision.references?.algorithm_id || null,
      algorithm_version: decision.references?.algorithm_version || null,
      decision: decision.metadata?.decision || null,
      reason_codes: Array.isArray(decision.metadata?.reason_codes) ? decision.metadata.reason_codes : [],
      assignment_factors: decision.metadata?.assignment_factors || {},
      evidence_status: 'RECORDED'
    }));
  const decisionIds = new Set(visibleDecisions.map((decision) => decision.decision_id));
  const visibleReviews = Object.values(reviews)
    .filter((review) => review?.requested_by === driverId || decisionIds.has(review?.subject_id))
    .map((review) => ({
      review_id: review.review_id,
      subject_type: review.subject_type,
      subject_id: review.subject_id,
      status: review.status,
      requested_at: review.requested_at,
      decision_count: Object.keys(review.decisions || {}).length
    }));

  return {
    schema_version: 'platform_compliance_readiness_v1',
    mode: 'READ_ONLY_PREPARATION',
    writes_performed: false,
    work_time: {
      tasks: buildWorkTimeEvidence(events),
      summary: summarizeWorkEvents(events)
    },
    earnings: {
      status: 'NOT_COMPUTED',
      reason: 'LEDGER_AND_PROFESSIONAL_POLICY_REQUIRED'
    },
    algorithmic_management: {
      decisions: visibleDecisions,
      transparency_status: visibleDecisions.length ? 'EVIDENCE_RECORDED' : 'NO_EVIDENCE'
    },
    weekly_statement: {
      status: 'NOT_ISSUED',
      reason: 'LEGAL_FISCAL_LEDGER_GATE_BLOCKED'
    },
    review: {
      reviews: visibleReviews,
      human_review_required: false
    },
    fiscal: {
      status: 'NOT_COMPUTED',
      professional_approval_status: 'PENDING'
    }
  };
}
