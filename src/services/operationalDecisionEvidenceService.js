import { isPrivilegedUser } from './operationalEvidenceService.js';

function sortedEvents(events = {}) {
  return Object.values(events)
    .filter((event) => event && typeof event === 'object')
    .sort((left, right) => Number(left.occurred_at || 0) - Number(right.occurred_at || 0));
}

function flattenDecisions(decisions = {}) {
  return Object.values(decisions)
    .flatMap((value) => (value?.event_id ? [value] : Object.values(value || {})))
    .filter((decision) => decision?.event_id);
}

function observedOutcome(events, orderId, candidateDriverIds = []) {
  const orderEvents = sortedEvents(events).filter((event) => event.references?.order_id === orderId);
  const accepted = orderEvents.find((event) => event.event_type === 'OFFER_ACCEPTED') || null;
  const delivered = orderEvents.find((event) => event.event_type === 'DELIVERED') || null;
  const cancelled = orderEvents.find((event) => event.event_type === 'CANCELLED') || null;

  return {
    selected_driver_id_observed: accepted?.actor_id || null,
    selected_candidate_observed: accepted ? candidateDriverIds.includes(accepted.actor_id) : null,
    accepted_at_observed: accepted?.occurred_at || null,
    completed_at_observed: delivered?.occurred_at || null,
    cancelled_at_observed: cancelled?.occurred_at || null,
    completion_observed: Boolean(delivered),
    outcome_status: delivered ? 'COMPLETED_OBSERVED' : cancelled ? 'CANCELLED_OBSERVED' : 'PENDING_OR_UNOBSERVED'
  };
}

function projectDecision(decision, events) {
  const metadata = decision.metadata || {};
  const candidateDriverIds = Array.isArray(metadata.candidate_driver_ids) ? metadata.candidate_driver_ids : [];
  const orderId = decision.references?.order_id || null;
  const outcome = orderId ? observedOutcome(events, orderId, candidateDriverIds) : null;

  return {
    decision_id: decision.event_id,
    order_id: orderId,
    algorithm_id: decision.references?.algorithm_id || null,
    algorithm_version: decision.references?.algorithm_version || null,
    decision: metadata.decision || null,
    candidate_driver_ids: candidateDriverIds,
    reason_codes: Array.isArray(metadata.reason_codes) ? metadata.reason_codes : [],
    assignment_factors: metadata.assignment_factors || {},
    human_override: metadata.human_override === true,
    review_id: metadata.review_id || null,
    occurred_at: decision.occurred_at || null,
    outcome_observed: outcome,
    metric_scope: 'RECORDED_DECISION_AND_OBSERVED_EXECUTION_ONLY'
  };
}

export function buildOrderDecisionEvidence({ decisions = {}, driverEvents = {} }) {
  return flattenDecisions(decisions)
    .sort((left, right) => Number(left.occurred_at || 0) - Number(right.occurred_at || 0))
    .map((decision) => projectDecision(decision, driverEvents));
}

export function buildDriverDecisionMetrics({ decisions = {}, events = {}, driverId }) {
  const projected = flattenDecisions(decisions)
    .filter((decision) => decision.metadata?.candidate_driver_ids?.includes(driverId))
    .map((decision) => projectDecision(decision, events));
  const accepted = projected.filter((decision) => decision.outcome_observed?.selected_driver_id_observed === driverId);
  const completed = accepted.filter((decision) => decision.outcome_observed?.completion_observed);
  const routeContinuous = accepted.filter((decision) => decision.assignment_factors?.route_continuity === true);

  return {
    mode: 'READ_ONLY_OPERATIONAL_DECISION_EVIDENCE',
    decision_count_observed: projected.length,
    accepted_decision_count_observed: accepted.length,
    completed_decision_count_observed: completed.length,
    completion_rate_observed: accepted.length ? Number((completed.length / accepted.length).toFixed(4)) : null,
    route_continuity_rate_observed: accepted.length ? Number((routeContinuous.length / accepted.length).toFixed(4)) : null,
    decision_quality_status: 'OBSERVED_OUTCOMES_NOT_ALGORITHMIC_CAUSALITY',
    money: { status: 'NOT_COMPUTED' },
    fiscal: { status: 'NOT_COMPUTED' },
    labor_status: { status: 'NOT_DETERMINED' },
    writes_performed: false,
    effects: []
  };
}

export function canAccessOperationalDecisionEvidence(user = {}, driverId) {
  return isPrivilegedUser(user) || user.uid === driverId;
}
