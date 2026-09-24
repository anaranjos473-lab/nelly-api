import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import {
  REVIEW_OUTCOMES,
  WORK_EVENT_TYPES,
  buildComplianceReadiness,
  buildRouteEvidence,
  buildWorkTimeEvidence,
  createImmutableEvent,
  createIdempotencyFingerprint,
  isPrivilegedUser,
  requireSafeId,
  requireString,
  requireTimestamp,
  simulateDriverOperationalMode,
  summarizeDriverProductivity,
  summarizeMerchantPerformance,
  summarizeWorkEvents
} from '../src/services/operationalEvidenceService.js';

const router = express.Router();
const ASSIGNMENT_FACTOR_FIELDS = new Set([
  'distance_meters',
  'eta_seconds',
  'h3_zone',
  'vehicle_type',
  'availability',
  'route_continuity',
  'batch_possible',
  'demand_level',
  'capacity_available',
  'proximity_band'
]);
const OBSERVED_EVIDENCE_FIELDS = new Set([
  'observed_distance_meters',
  'estimated_eta_seconds',
  'h3_zone',
  'route_continuity'
]);

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  try {
    return JSON.parse(Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
  } catch {
    return null;
  }
}

async function requireAuthenticatedUser(req, res, next) {
  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) return res.status(401).json({ ok: false, error: 'Token requerido' });

  try {
    const admin = await getAdmin();
    req.firebaseUser = await admin.auth().verifyIdToken(token);
    return next();
  } catch (error) {
    if (process.env.NODE_ENV !== 'production') {
      const decoded = decodeJwtPayload(token);
      if (decoded && (decoded.uid || decoded.sub || decoded.user_id)) {
        req.firebaseUser = {
          ...decoded,
          uid: decoded.uid || decoded.sub || decoded.user_id,
          admin: Boolean(decoded.admin || decoded.claims?.admin),
          panel: Boolean(decoded.panel || decoded.claims?.panel),
          role: decoded.role || decoded.claims?.role
        };
        return next();
      }
    }
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

function requirePrivilegedUser(req, res, next) {
  if (!isPrivilegedUser(req.firebaseUser)) {
    return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
  }
  return next();
}

function canAccessDriver(user, driverId) {
  return isPrivilegedUser(user) || user.uid === driverId;
}

function optionalReasonCodes(value) {
  if (value === undefined) return [];
  if (!Array.isArray(value) || value.length > 30) {
    const error = new Error('reason_codes invalido');
    error.statusCode = 400;
    throw error;
  }
  return value.map((code) => requireSafeId(code, 'reason_code'));
}

function optionalAssignmentFactors(value) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value) || Object.keys(value).length > 30) {
    const error = new Error('assignment_factors invalido');
    error.statusCode = 400;
    throw error;
  }
  return Object.fromEntries(Object.entries(value).map(([key, factor]) => {
    requireSafeId(key, 'assignment_factor');
    if (!ASSIGNMENT_FACTOR_FIELDS.has(key)) {
      const error = new Error('assignment_factor no permitido para evidencia operacional');
      error.statusCode = 400;
      throw error;
    }
    if (!['string', 'number', 'boolean'].includes(typeof factor) || (typeof factor === 'number' && !Number.isFinite(factor))) {
      const error = new Error('assignment_factor invalido');
      error.statusCode = 400;
      throw error;
    }
    return [key, factor];
  }));
}

function optionalNonNegativeInteger(value, field) {
  if (value === undefined) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 0) {
    const error = new Error(`${field} invalido`);
    error.statusCode = 400;
    throw error;
  }
  return number;
}

function optionalWorkEvidence(value) {
  if (value === undefined) return {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    const error = new Error('observed_evidence invalido');
    error.statusCode = 400;
    throw error;
  }
  if (Object.keys(value).some((key) => !OBSERVED_EVIDENCE_FIELDS.has(key))) {
    const error = new Error('observed_evidence contiene un campo no permitido');
    error.statusCode = 400;
    throw error;
  }
  const evidence = {};
  const distance = optionalNonNegativeInteger(value.observed_distance_meters, 'observed_distance_meters');
  const eta = optionalNonNegativeInteger(value.estimated_eta_seconds, 'estimated_eta_seconds');
  if (distance !== null) evidence.observed_distance_meters = distance;
  if (eta !== null) evidence.estimated_eta_seconds = eta;
  if (value.h3_zone !== undefined) evidence.h3_zone = requireSafeId(value.h3_zone, 'h3_zone');
  if (value.route_continuity !== undefined) {
    if (typeof value.route_continuity !== 'boolean') {
      const error = new Error('route_continuity invalido');
      error.statusCode = 400;
      throw error;
    }
    evidence.route_continuity = value.route_continuity;
  }
  return evidence;
}

function visibleDispatchDecisions(decisions, user) {
  return isPrivilegedUser(user)
    ? Object.values(decisions)
    : Object.values(decisions).filter((decision) => decision.metadata?.candidate_driver_ids?.includes(user.uid));
}

function respondError(res, next, error) {
  if (error?.statusCode) {
    return res.status(error.statusCode).json({ ok: false, error: error.message });
  }
  return next(error);
}

async function writeIdempotent(ref, record, idField, fingerprint) {
  let reusedExistingRecord = false;
  const result = await ref.transaction((current) => {
    if (current) {
      reusedExistingRecord = true;
      return current;
    }
    return record;
  });
  const existing = result.snapshot.val();
  if (existing?.[idField] !== record[idField]) {
    const error = new Error('Conflicto de identificador de evidencia');
    error.statusCode = 409;
    throw error;
  }
  if (existing?.idempotency_fingerprint !== fingerprint) {
    const error = new Error('La clave idempotente ya se uso con un payload distinto');
    error.statusCode = 409;
    throw error;
  }
  return { record: existing, idempotent: reusedExistingRecord };
}

router.post('/work-events', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.body?.driver_id || req.firebaseUser.uid, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'No autorizado para registrar evidencia de otro repartidor' });
    }
    const eventId = requireSafeId(req.body?.event_id, 'event_id');
    const eventType = requireString(req.body?.event_type, 'event_type', 80).toUpperCase();
    if (!WORK_EVENT_TYPES.has(eventType)) {
      return res.status(400).json({ ok: false, error: 'event_type no soportado' });
    }
    const occurredAt = requireTimestamp(req.body?.occurred_at, 'occurred_at');
    const orderId = req.body?.order_id ? requireSafeId(req.body.order_id, 'order_id') : null;
    const routeId = req.body?.route_id ? requireSafeId(req.body.route_id, 'route_id') : null;
    const observedEvidence = optionalWorkEvidence(req.body?.observed_evidence);
    const recordedAt = Date.now();
    const event = createImmutableEvent({
      id: eventId,
      type: eventType,
      actorId: req.firebaseUser.uid,
      occurredAt,
      recordedAt,
      references: { ...(orderId ? { order_id: orderId } : {}), ...(routeId ? { route_id: routeId } : {}) },
      metadata: { source: 'api', ...observedEvidence }
    });
    const fingerprint = createIdempotencyFingerprint({ driverId, event: { ...event, recorded_at: undefined } });
    const persistedEvent = { ...event, idempotency_fingerprint: fingerprint };
    const admin = await getAdmin();
    const written = await writeIdempotent(admin.database().ref(`work_ledger/${driverId}/${eventId}`), persistedEvent, 'event_id', fingerprint);
    return res.status(201).json({ ok: true, driver_id: driverId, event: written.record, idempotent: written.idempotent });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/work-summary', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return res.json({ ok: true, driver_id: driverId, summary: summarizeWorkEvents(events) });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/productivity', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return res.json({ ok: true, driver_id: driverId, productivity: summarizeDriverProductivity(events) });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/work-time-evidence', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return res.json({ ok: true, driver_id: driverId, tasks: buildWorkTimeEvidence(events), writes_performed: false });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/route-evidence', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return res.json({ ok: true, driver_id: driverId, routes: buildRouteEvidence(events), writes_performed: false });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/status-simulation', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return res.json({ ok: true, driver_id: driverId, simulation: simulateDriverOperationalMode(events) });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/compliance-readiness', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessDriver(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const [eventsSnapshot, decisionsSnapshot, reviewsSnapshot] = await Promise.all([
      admin.database().ref(`work_ledger/${driverId}`).once('value'),
      admin.database().ref('dispatch_decisions').once('value'),
      admin.database().ref('human_reviews').once('value')
    ]);
    return res.json({
      ok: true,
      driver_id: driverId,
      readiness: buildComplianceReadiness({
        driverId,
        events: eventsSnapshot.val() || {},
        dispatchDecisions: decisionsSnapshot.val() || {},
        reviews: reviewsSnapshot.val() || {}
      })
    });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/merchants/:merchantId/performance', requireAuthenticatedUser, requirePrivilegedUser, async (req, res, next) => {
  try {
    const merchantId = requireSafeId(req.params.merchantId, 'merchant_id');
    const admin = await getAdmin();
    const orders = (await admin.database().ref('pedidos').once('value')).val() || {};
    return res.json({ ok: true, merchant_id: merchantId, performance: summarizeMerchantPerformance(orders, merchantId) });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.post('/algorithm-versions', requireAuthenticatedUser, requirePrivilegedUser, async (req, res, next) => {
  try {
    const algorithmId = requireSafeId(req.body?.algorithm_id, 'algorithm_id');
    const version = requireSafeId(req.body?.version, 'version');
    const effectiveFrom = requireTimestamp(req.body?.effective_from, 'effective_from');
    const criteria = req.body?.criteria;
    if (!criteria || typeof criteria !== 'object' || Array.isArray(criteria)) {
      return res.status(400).json({ ok: false, error: 'criteria es requerido' });
    }
    const record = {
      algorithm_id: algorithmId,
      version,
      effective_from: effectiveFrom,
      effective_to: req.body?.effective_to ? requireTimestamp(req.body.effective_to, 'effective_to') : null,
      criteria: { ...criteria },
      change_reason: requireString(req.body?.change_reason, 'change_reason'),
      recorded_at: Date.now(),
      recorded_by: req.firebaseUser.uid
    };
    const fingerprint = createIdempotencyFingerprint({ ...record, recorded_at: undefined });
    record.idempotency_fingerprint = fingerprint;
    const admin = await getAdmin();
    const written = await writeIdempotent(admin.database().ref(`algorithm_versions/${algorithmId}/${version}`), record, 'version', fingerprint);
    return res.status(201).json({ ok: true, algorithm_version: written.record, idempotent: written.idempotent });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/algorithm-versions/:algorithmId/:version', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const algorithmId = requireSafeId(req.params.algorithmId, 'algorithm_id');
    const version = requireSafeId(req.params.version, 'version');
    const admin = await getAdmin();
    const record = (await admin.database().ref(`algorithm_versions/${algorithmId}/${version}`).once('value')).val();
    if (!record) return res.status(404).json({ ok: false, error: 'Version no encontrada' });
    return res.json({ ok: true, algorithm_version: record });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.post('/dispatch-decisions', requireAuthenticatedUser, requirePrivilegedUser, async (req, res, next) => {
  try {
    const orderId = requireSafeId(req.body?.order_id, 'order_id');
    const decisionId = requireSafeId(req.body?.decision_id, 'decision_id');
    const algorithmId = requireSafeId(req.body?.algorithm_id, 'algorithm_id');
    const algorithmVersion = requireSafeId(req.body?.algorithm_version, 'algorithm_version');
    const decision = requireString(req.body?.decision, 'decision', 80).toUpperCase();
    const reasonCodes = optionalReasonCodes(req.body?.reason_codes);
    const assignmentFactors = optionalAssignmentFactors(req.body?.assignment_factors);
    const humanOverride = req.body?.human_override === true;
    const reviewId = req.body?.review_id ? requireSafeId(req.body.review_id, 'review_id') : null;
    const candidateDriverIds = Array.isArray(req.body?.candidate_driver_ids)
      ? req.body.candidate_driver_ids.map((id) => requireSafeId(id, 'candidate_driver_id'))
      : [];
    const record = createImmutableEvent({
      id: decisionId,
      type: 'DISPATCH_DECISION',
      actorId: req.firebaseUser.uid,
      occurredAt: req.body?.occurred_at ? requireTimestamp(req.body.occurred_at, 'occurred_at') : Date.now(),
      recordedAt: Date.now(),
      references: { order_id: orderId, algorithm_id: algorithmId, algorithm_version: algorithmVersion },
      metadata: {
        decision,
        candidate_driver_ids: candidateDriverIds,
        reason_codes: reasonCodes,
        assignment_factors: assignmentFactors,
        human_override: humanOverride,
        review_id: reviewId
      }
    });
    const fingerprint = createIdempotencyFingerprint({ orderId, record: { ...record, recorded_at: undefined } });
    const persistedRecord = { ...record, idempotency_fingerprint: fingerprint };
    const admin = await getAdmin();
    const written = await writeIdempotent(admin.database().ref(`dispatch_decisions/${orderId}/${decisionId}`), persistedRecord, 'event_id', fingerprint);
    return res.status(201).json({ ok: true, decision: written.record, idempotent: written.idempotent });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/orders/:orderId/dispatch-evidence', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const orderId = requireSafeId(req.params.orderId, 'order_id');
    const admin = await getAdmin();
    const decisions = (await admin.database().ref(`dispatch_decisions/${orderId}`).once('value')).val() || {};
    const visibleDecisions = visibleDispatchDecisions(decisions, req.firebaseUser);
    return res.json({ ok: true, order_id: orderId, decisions: visibleDecisions });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/orders/:orderId/assignment-evidence', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const orderId = requireSafeId(req.params.orderId, 'order_id');
    const admin = await getAdmin();
    const decisions = (await admin.database().ref(`dispatch_decisions/${orderId}`).once('value')).val() || {};
    const evidence = visibleDispatchDecisions(decisions, req.firebaseUser).map((decision) => ({
      decision_id: decision.event_id,
      order_id: decision.references?.order_id || orderId,
      algorithm_id: decision.references?.algorithm_id || null,
      algorithm_version: decision.references?.algorithm_version || null,
      candidate_driver_ids: decision.metadata?.candidate_driver_ids || [],
      reason_codes: decision.metadata?.reason_codes || [],
      assignment_factors: decision.metadata?.assignment_factors || {},
      human_override: decision.metadata?.human_override === true,
      review_id: decision.metadata?.review_id || null,
      decision: decision.metadata?.decision || null,
      occurred_at: decision.occurred_at
    }));
    return res.json({ ok: true, order_id: orderId, evidence, writes_performed: false });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.post('/reviews', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const reviewId = requireSafeId(req.body?.review_id, 'review_id');
    const subjectType = requireString(req.body?.subject_type, 'subject_type', 80).toUpperCase();
    const subjectId = requireSafeId(req.body?.subject_id, 'subject_id');
    const reason = requireString(req.body?.reason, 'reason');
    const record = {
      review_id: reviewId,
      subject_type: subjectType,
      subject_id: subjectId,
      reason,
      requested_by: req.firebaseUser.uid,
      requested_at: Date.now(),
      status: 'OPEN',
      decisions: {}
    };
    const fingerprint = createIdempotencyFingerprint({ ...record, requested_at: undefined });
    record.idempotency_fingerprint = fingerprint;
    const admin = await getAdmin();
    const written = await writeIdempotent(admin.database().ref(`human_reviews/${reviewId}`), record, 'review_id', fingerprint);
    return res.status(201).json({ ok: true, review: written.record, idempotent: written.idempotent });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/reviews/:reviewId', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const reviewId = requireSafeId(req.params.reviewId, 'review_id');
    const admin = await getAdmin();
    const review = (await admin.database().ref(`human_reviews/${reviewId}`).once('value')).val();
    if (!review) return res.status(404).json({ ok: false, error: 'Revision no encontrada' });
    if (!isPrivilegedUser(req.firebaseUser) && review.requested_by !== req.firebaseUser.uid) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    return res.json({ ok: true, review });
  } catch (error) {
    return next(error);
  }
});

router.post('/reviews/:reviewId/decisions', requireAuthenticatedUser, requirePrivilegedUser, async (req, res, next) => {
  try {
    const reviewId = requireSafeId(req.params.reviewId, 'review_id');
    const decisionId = requireSafeId(req.body?.decision_id, 'decision_id');
    const outcome = requireString(req.body?.outcome, 'outcome', 80).toUpperCase();
    if (!REVIEW_OUTCOMES.has(outcome)) {
      return res.status(400).json({ ok: false, error: 'outcome no soportado para revision no ejecutiva' });
    }
    const rationale = requireString(req.body?.rationale, 'rationale');
    const admin = await getAdmin();
    const ref = admin.database().ref(`human_reviews/${reviewId}`);
    const recordedAt = Date.now();
    const result = await ref.transaction((current) => {
      if (!current) return undefined;
      const existing = current.decisions?.[decisionId];
      if (existing) {
        if (existing.outcome !== outcome || existing.rationale !== rationale) {
          const error = new Error('La clave idempotente ya se uso con un payload distinto');
          error.statusCode = 409;
          throw error;
        }
        return current;
      }
      const decision = { decision_id: decisionId, outcome, rationale, decided_by: req.firebaseUser.uid, decided_at: recordedAt };
      return {
        ...current,
        status: outcome === 'CLOSED_NO_ACTION' ? 'CLOSED' : 'OPEN',
        last_decision_id: decisionId,
        decisions: { ...(current.decisions || {}), [decisionId]: decision }
      };
    });
    if (!result.committed) return res.status(404).json({ ok: false, error: 'Revision no encontrada' });
    return res.status(201).json({ ok: true, review: result.snapshot.val() });
  } catch (error) {
    return next(error);
  }
});

export default router;
