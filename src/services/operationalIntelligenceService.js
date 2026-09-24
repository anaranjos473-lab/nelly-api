import { isPrivilegedUser, summarizeDriverProductivity } from './operationalEvidenceService.js';

function sortedEvents(events = {}) {
  return Object.values(events)
    .filter((event) => event && typeof event === 'object')
    .sort((left, right) => Number(left.occurred_at || 0) - Number(right.occurred_at || 0));
}

function secondsBetween(start, end) {
  if (!Number.isSafeInteger(start) || !Number.isSafeInteger(end) || end < start) return null;
  return Math.round((end - start) / 1000);
}

function roundRatio(numerator, denominator) {
  if (!denominator) return null;
  return Math.round((numerator / denominator) * 10000) / 10000;
}

function taskRecords(events = {}) {
  const tasks = new Map();
  for (const event of sortedEvents(events)) {
    const orderId = event.references?.order_id;
    if (!orderId) continue;
    const task = tasks.get(orderId) || {
      order_id: orderId,
      route_id: event.references?.route_id || null,
      accepted_at: null,
      arrived_pickup_at: null,
      order_ready_at: null,
      picked_up_at: null,
      arrived_dropoff_at: null,
      completed_at: null,
      cancelled_at: null,
      eta_estimated_seconds_observed: null
    };

    if (event.references?.route_id) task.route_id = event.references.route_id;
    if (event.event_type === 'OFFER_ACCEPTED' && task.accepted_at === null) {
      task.accepted_at = event.occurred_at;
      if (Number.isSafeInteger(event.metadata?.estimated_eta_seconds)) {
        task.eta_estimated_seconds_observed = event.metadata.estimated_eta_seconds;
      }
    }
    if (event.event_type === 'ARRIVED_MERCHANT' && task.arrived_pickup_at === null) task.arrived_pickup_at = event.occurred_at;
    if (event.event_type === 'ORDER_READY' && task.order_ready_at === null) task.order_ready_at = event.occurred_at;
    if (event.event_type === 'PICKUP' && task.picked_up_at === null) task.picked_up_at = event.occurred_at;
    if (event.event_type === 'ARRIVED_DROPOFF' && task.arrived_dropoff_at === null) task.arrived_dropoff_at = event.occurred_at;
    if (event.event_type === 'DELIVERED') task.completed_at = event.occurred_at;
    if (event.event_type === 'CANCELLED') task.cancelled_at = event.occurred_at;
    tasks.set(orderId, task);
  }
  return [...tasks.values()];
}

function buildTimeQuality(tasks) {
  return tasks.map((task) => {
    const actualEta = secondsBetween(task.accepted_at, task.completed_at);
    const deviation = actualEta !== null && task.eta_estimated_seconds_observed !== null
      ? actualEta - task.eta_estimated_seconds_observed
      : null;
    const accuracy = task.eta_estimated_seconds_observed !== null && actualEta !== null && deviation !== null
      ? Math.max(0, roundRatio(task.eta_estimated_seconds_observed - Math.abs(deviation || 0), task.eta_estimated_seconds_observed))
      : null;
    return {
      ...task,
      travel_to_pickup_seconds_observed: secondsBetween(task.accepted_at, task.arrived_pickup_at),
      merchant_wait_seconds_observed: secondsBetween(task.arrived_pickup_at, task.order_ready_at),
      pickup_handoff_seconds_observed: secondsBetween(task.order_ready_at, task.picked_up_at),
      pickup_to_dropoff_seconds_observed: secondsBetween(task.picked_up_at, task.arrived_dropoff_at),
      dropoff_handoff_seconds_observed: secondsBetween(task.arrived_dropoff_at, task.completed_at),
      total_effective_seconds_observed: actualEta,
      eta_actual_seconds_observed: actualEta,
      eta_deviation_seconds_observed: deviation,
      eta_accuracy_ratio_observed: accuracy,
      metric_scope: 'OBSERVED_TIME_EVIDENCE_ONLY'
    };
  });
}

function stageCandidates(task) {
  const candidates = [
    ['TRAVEL_TO_PICKUP_OBSERVED', task.travel_to_pickup_seconds_observed],
    ['MERCHANT_WAIT_OBSERVED', task.merchant_wait_seconds_observed],
    ['PICKUP_HANDOFF_OBSERVED', task.pickup_handoff_seconds_observed],
    ['PICKUP_TO_DROPOFF_OBSERVED', task.pickup_to_dropoff_seconds_observed],
    ['DROPOFF_HANDOFF_OBSERVED', task.dropoff_handoff_seconds_observed]
  ].filter(([, seconds]) => seconds !== null);
  if (!candidates.length) return null;
  const [stage, seconds] = candidates.sort((left, right) => right[1] - left[1])[0];
  return { stage, seconds };
}

export function buildOperationalBottlenecks(events = {}) {
  return buildTimeQuality(taskRecords(events)).map((task) => ({
    order_id: task.order_id,
    route_id: task.route_id,
    longest_observed_stage: stageCandidates(task),
    unobserved_categories: ['CUSTOMER_DELAY', 'SYSTEM_DELAY'],
    attribution: 'NOT_DETERMINED',
    metric_scope: 'OBSERVED_STAGE_DURATIONS_ONLY'
  }));
}

export function buildRouteProductivity(events = {}) {
  const routes = new Map();
  for (const event of sortedEvents(events)) {
    const routeId = event.references?.route_id;
    if (!routeId) continue;
    const route = routes.get(routeId) || {
      route_id: routeId,
      order_ids: new Set(),
      completed_order_ids: new Set(),
      first_observed_at: event.occurred_at,
      last_observed_at: event.occurred_at,
      observed_distance_meters: null,
      route_continuity_observed: false
    };
    if (event.references?.order_id) route.order_ids.add(event.references.order_id);
    if (event.event_type === 'DELIVERED' && event.references?.order_id) route.completed_order_ids.add(event.references.order_id);
    route.last_observed_at = event.occurred_at;
    if (Number.isSafeInteger(event.metadata?.observed_distance_meters)) route.observed_distance_meters = event.metadata.observed_distance_meters;
    if (event.metadata?.route_continuity === true) route.route_continuity_observed = true;
    routes.set(routeId, route);
  }

  return [...routes.values()].map((route) => {
    const duration = secondsBetween(route.first_observed_at, route.last_observed_at);
    const orderCount = route.order_ids.size;
    const completedCount = route.completed_order_ids.size;
    return {
      route_id: route.route_id,
      order_ids: [...route.order_ids].sort(),
      route_order_count: orderCount,
      completed_order_count: completedCount,
      route_duration_seconds_observed: duration,
      observed_orders_per_hour: duration ? roundRatio(completedCount * 3600, duration) : null,
      observed_distance_meters: route.observed_distance_meters,
      observed_distance_per_order_meters: route.observed_distance_meters === null || !orderCount
        ? null
        : Math.round(route.observed_distance_meters / orderCount),
      route_continuity_observed: route.route_continuity_observed,
      metric_scope: 'OBSERVED_ROUTE_PRODUCTIVITY_ONLY'
    };
  });
}

export function buildOperationalIntelligence(events = {}) {
  const tasks = buildTimeQuality(taskRecords(events));
  return {
    mode: 'READ_ONLY_OPERATIONAL_ANALYTICS',
    writes_performed: false,
    effects: [],
    time_quality: tasks,
    route_productivity: buildRouteProductivity(events),
    bottlenecks: buildOperationalBottlenecks(events),
    productivity: summarizeDriverProductivity(events),
    money: { status: 'NOT_COMPUTED' },
    fiscal: { status: 'NOT_COMPUTED' },
    labor_status: { status: 'NOT_DETERMINED' }
  };
}

export function canAccessOperationalIntelligence(user, driverId) {
  return isPrivilegedUser(user) || user.uid === driverId;
}
