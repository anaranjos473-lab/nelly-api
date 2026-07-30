import { getAdmin } from '../config/firebase-admin-esm.js';
import { buildArchiveEngineUpdates } from './archiveEngine.js';

const DEFAULT_HOUR = 0;
const DEFAULT_MINUTE = 5;

function getMexicoCityParts(date = new Date()) {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  }).formatToParts(date);
  const lookup = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return {
    year: Number(lookup.year || 0),
    month: Number(lookup.month || 0),
    day: Number(lookup.day || 0),
    hour: Number(lookup.hour || 0),
    minute: Number(lookup.minute || 0),
    second: Number(lookup.second || 0)
  };
}

function getNextMexicoCityRun(now = new Date(), hour = DEFAULT_HOUR, minute = DEFAULT_MINUTE) {
  const current = getMexicoCityParts(now);
  const utcParts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'America/Mexico_City',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  }).formatToParts(now);
  const dateLookup = Object.fromEntries(utcParts.map((part) => [part.type, part.value]));
  const base = new Date(`${dateLookup.year}-${dateLookup.month}-${dateLookup.day}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00`);
  if (current.hour > hour || (current.hour === hour && current.minute >= minute)) {
    base.setDate(base.getDate() + 1);
  }
  return base;
}

async function runArchiveEngineJob({ logger = console } = {}) {
  const admin = await getAdmin();
  const db = admin.database();
  const snapshot = await db.ref('pedidos').once('value');
  const pedidos = snapshot.val() || {};
  const orders = Object.entries(pedidos).map(([id, pedido]) => ({ id, ...pedido }));
  const updates = buildArchiveEngineUpdates(orders);
  await db.ref().update(updates);
  logger.info?.('[NAE] archive job completed', { orders: orders.length });
  return { ok: true, orders: orders.length };
}

function scheduleArchiveEngineDailyJob({ logger = console } = {}) {
  if (String(process.env.ENABLE_NAE_JOB || 'true').toLowerCase() !== 'true') {
    logger.info?.('[NAE] daily job disabled by env');
    return { stop: () => {} };
  }

  let timer = null;

  const scheduleNext = () => {
    const now = new Date();
    const nextRun = getNextMexicoCityRun(now);
    const delay = Math.max(1000, nextRun.getTime() - now.getTime());
    timer = setTimeout(async () => {
      try {
        await runArchiveEngineJob({ logger });
      } catch (error) {
        logger.error?.('[NAE] archive job failed', error.message);
      } finally {
        scheduleNext();
      }
    }, delay);
    logger.info?.('[NAE] next archive job scheduled', { nextRun: nextRun.toISOString(), delay });
  };

  scheduleNext();

  return {
    stop() {
      if (timer) clearTimeout(timer);
      timer = null;
    }
  };
}

export {
  getNextMexicoCityRun,
  runArchiveEngineJob,
  scheduleArchiveEngineDailyJob
};
