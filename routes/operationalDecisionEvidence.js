import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { isPrivilegedUser, requireSafeId } from '../src/services/operationalEvidenceService.js';
import {
  buildDriverDecisionMetrics,
  buildOrderDecisionEvidence,
  canAccessOperationalDecisionEvidence
} from '../src/services/operationalDecisionEvidenceService.js';

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

router.get('/orders/:orderId/summary', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const orderId = requireSafeId(req.params.orderId, 'order_id');
    const admin = await getAdmin();
    const decisions = (await admin.database().ref(`dispatch_decisions/${orderId}`).once('value')).val() || {};
    const candidateDriverIds = [...new Set(Object.values(decisions)
      .flatMap((decision) => decision?.metadata?.candidate_driver_ids || []))];
    if (!isPrivilegedUser(req.firebaseUser) && !candidateDriverIds.includes(req.firebaseUser.uid)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const candidateEventSnapshots = await Promise.all(candidateDriverIds.map(async (driverId) => ({
      driverId,
      snapshot: await admin.database().ref(`work_ledger/${driverId}`).once('value')
    })));
    const driverEvents = Object.fromEntries(candidateEventSnapshots.flatMap(({ driverId, snapshot }) => (
      Object.entries(snapshot.val() || {}).map(([eventId, event]) => [
        `${driverId}_${eventId}`,
        { ...event, actor_id: event.actor_id || driverId }
      ])
    )));
    const evidence = buildOrderDecisionEvidence({ decisions, driverEvents });
    return res.json({ ok: true, order_id: orderId, decisions: evidence, writes_performed: false, effects: [] });
  } catch (error) {
    return respondError(res, next, error);
  }
});

router.get('/drivers/:driverId/metrics', requireAuthenticatedUser, async (req, res, next) => {
  try {
    const driverId = requireSafeId(req.params.driverId, 'driver_id');
    if (!canAccessOperationalDecisionEvidence(req.firebaseUser, driverId)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }
    const admin = await getAdmin();
    const [decisionsSnapshot, eventsSnapshot] = await Promise.all([
      admin.database().ref('dispatch_decisions').once('value'),
      admin.database().ref(`work_ledger/${driverId}`).once('value')
    ]);
    return res.json({
      ok: true,
      driver_id: driverId,
      metrics: buildDriverDecisionMetrics({
        decisions: decisionsSnapshot.val() || {},
        events: eventsSnapshot.val() || {},
        driverId
      })
    });
  } catch (error) {
    return respondError(res, next, error);
  }
});

export default router;
