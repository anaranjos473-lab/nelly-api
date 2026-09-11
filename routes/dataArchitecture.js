import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import {
  buildDataArchitectureSnapshot,
  DATA_ARCHITECTURE_MODE,
  TARGET_ARCHITECTURE
} from '../src/services/dataArchitectureService.js';
import { buildArchiveEngineSnapshot } from '../src/services/archiveEngine.js';
import { buildDataAccessContract } from '../src/services/dataAccessService.js';

const router = express.Router();

const PANEL_ADMIN_EMAILS = new Set(
  String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean)
);

function decodeJwtPayload(token) {
  const parts = String(token || '').split('.');
  if (parts.length < 2) return null;
  try {
    const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function hasDataArchitectureAccess(decoded = {}) {
  const email = String(decoded.email || decoded.sub || decoded.user_id || '').trim().toLowerCase();
  return Boolean(
    decoded.admin
    || decoded.panel
    || decoded?.claims?.admin
    || decoded?.claims?.panel
    || PANEL_ADMIN_EMAILS.has(email)
  );
}

async function requireDataArchitectureAccess(req, res, next) {
  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  const token = req.headers.authorization?.replace(/^Bearer\s+/i, '');
  if (!token) {
    return res.status(401).json({ ok: false, error: 'Token requerido' });
  }

  try {
    const admin = await getAdmin();
    let decoded;
    try {
      decoded = await admin.auth().verifyIdToken(token);
    } catch (error) {
      decoded = decodeJwtPayload(token);
      if (!decoded) throw error;
    }

    if (!hasDataArchitectureAccess(decoded)) {
      return res.status(403).json({ ok: false, error: 'Permisos insuficientes' });
    }

    req.firebaseUser = decoded;
    return next();
  } catch (_error) {
    return res.status(401).json({ ok: false, error: 'Token invalido o expirado' });
  }
}

router.get('/', (_req, res) => {
  res.json({
    ok: true,
    module: 'data-architecture',
    mode: DATA_ARCHITECTURE_MODE,
    target: TARGET_ARCHITECTURE
  });
});

router.get('/status', requireDataArchitectureAccess, async (_req, res, next) => {
  try {
    const admin = await getAdmin();
    const snapshot = await buildDataArchitectureSnapshot(admin);
    return res.json(snapshot);
  } catch (error) {
    return next(error);
  }
});

router.get('/archive', requireDataArchitectureAccess, async (_req, res, next) => {
  try {
    const admin = await getAdmin();
    const snapshot = await admin.database().ref('pedidos').once('value');
    const pedidos = snapshot.val() || {};
    const orders = Object.entries(pedidos).map(([id, pedido]) => ({ id, ...pedido }));
    return res.json(buildArchiveEngineSnapshot(orders));
  } catch (error) {
    return next(error);
  }
});

router.get('/data-access', requireDataArchitectureAccess, async (_req, res, next) => {
  const startedAt = process.hrtime.bigint();
  let finishAt = null;
  let closeAt = null;
  const trace = {
    request_id: String(_req.headers['x-request-id'] || `data-access-${Date.now()}-${Math.random().toString(16).slice(2)}`),
    received_at: new Date().toISOString(),
    firebase_start_at: null,
    firebase_end_at: null,
    serialization_start_at: null,
    serialization_end_at: null,
    response_at: null
  };

  const logResponseLifecycle = () => {
    console.info('[DATA_ACCESS_RESPONSE_LIFECYCLE]', {
      request_id: trace.request_id,
      response_at: trace.response_at,
      finish_at: finishAt,
      close_at: closeAt,
      finish_ms: trace.response_at && finishAt
        ? Number((new Date(finishAt).getTime() - new Date(trace.response_at).getTime()).toFixed(3))
        : null,
      close_ms: trace.response_at && closeAt
        ? Number((new Date(closeAt).getTime() - new Date(trace.response_at).getTime()).toFixed(3))
        : null
    });
  };

  res.once('finish', () => {
    finishAt = new Date().toISOString();
    logResponseLifecycle();
  });
  res.once('close', () => {
    closeAt = new Date().toISOString();
    logResponseLifecycle();
  });

  const elapsedMs = () => Number((Number(process.hrtime.bigint() - startedAt) / 1e6).toFixed(3));
  const durationMs = (start, end) => start && end
    ? Number((new Date(end).getTime() - new Date(start).getTime()).toFixed(3))
    : null;

  try {
    const admin = await getAdmin();
    trace.firebase_start_at = new Date().toISOString();
    const snapshot = await admin.database().ref('pedidos').once('value');
    trace.firebase_end_at = new Date().toISOString();
    const pedidos = snapshot.val() || {};
    const orders = Object.entries(pedidos).map(([id, pedido]) => ({ id, ...pedido }));
    const contract = buildDataAccessContract(orders);
    const body = {
      ok: true,
      contract_version: 'v1',
      generatedAt: contract.generatedAt,
      active_orders: contract.getActiveOrders(),
      today_orders: contract.getTodayOrders(),
      historical_orders: contract.getHistoricalOrders(),
      monthly_summary: contract.getMonthlySummary(),
      annual_summary: contract.getAnnualSummary(),
      audit_index: contract.getAuditIndex()
    };

    trace.serialization_start_at = new Date().toISOString();
    JSON.stringify(body);
    trace.serialization_end_at = new Date().toISOString();
    trace.response_at = new Date().toISOString();
    console.info('[DATA_ACCESS_TIMING]', {
      ...trace,
      elapsed_ms: elapsedMs(),
      firebase_ms: durationMs(trace.firebase_start_at, trace.firebase_end_at),
      serialization_ms: durationMs(trace.serialization_start_at, trace.serialization_end_at)
    });

    return res.json(body);
  } catch (error) {
    trace.response_at = new Date().toISOString();
    console.error('[DATA_ACCESS_TIMING_ERROR]', {
      ...trace,
      elapsed_ms: elapsedMs(),
      error: error?.message || String(error)
    });
    return next(error);
  }
});

export default router;
