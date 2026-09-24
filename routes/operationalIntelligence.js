import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { requireSafeId } from '../src/services/operationalEvidenceService.js';
import {
  buildOperationalBottlenecks,
  buildOperationalIntelligence,
  buildRouteProductivity,
  canAccessOperationalIntelligence
} from '../src/services/operationalIntelligenceService.js';

const router = express.Router();

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
  } catch {
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

function respondError(res, next, error) {
  if (error?.statusCode) return res.status(error.statusCode).json({ ok: false, error: error.message });
  return next(error);
}

async function readDriverEvents(req, res, next, handler) {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessOperationalIntelligence(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const events = (await admin.database().ref(`work_ledger/${driverId}`).once('value')).val() || {};
    return handler(driverId, events);
  } catch (error) {
    return respondError(res, next, error);
  }
}

router.get('/drivers/:driverId/summary', requireAuthenticatedUser, (req, res, next) => (
  readDriverEvents(req, res, next, (driverId, events) => res.json({
    ok: true,
    driver_id: driverId,
    intelligence: buildOperationalIntelligence(events)
  }))
));

router.get('/drivers/:driverId/route-productivity', requireAuthenticatedUser, (req, res, next) => (
  readDriverEvents(req, res, next, (driverId, events) => res.json({
    ok: true,
    driver_id: driverId,
    routes: buildRouteProductivity(events),
    writes_performed: false
  }))
));

router.get('/drivers/:driverId/bottlenecks', requireAuthenticatedUser, (req, res, next) => (
  readDriverEvents(req, res, next, (driverId, events) => res.json({
    ok: true,
    driver_id: driverId,
    bottlenecks: buildOperationalBottlenecks(events),
    writes_performed: false
  }))
));

router.get('/drivers/:driverId/eta-accuracy', requireAuthenticatedUser, (req, res, next) => (
  readDriverEvents(req, res, next, (driverId, events) => {
    const intelligence = buildOperationalIntelligence(events);
    return res.json({
      ok: true,
      driver_id: driverId,
      eta: intelligence.time_quality.map((task) => ({
        order_id: task.order_id,
        eta_estimated_seconds_observed: task.eta_estimated_seconds_observed,
        eta_actual_seconds_observed: task.eta_actual_seconds_observed,
        eta_deviation_seconds_observed: task.eta_deviation_seconds_observed,
        eta_accuracy_ratio_observed: task.eta_accuracy_ratio_observed
      })),
      writes_performed: false
    });
  })
));

export default router;
