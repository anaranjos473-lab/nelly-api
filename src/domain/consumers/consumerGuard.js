function createEventConsumerGuard({
  dedupeKey = (event) => [event?.tipo || '', event?.aggregate_id || ''].join('|'),
  logger = console,
  name = 'EventConsumer'
} = {}) {
  const seen = new Set();

  function shouldProcess(event) {
    const key = dedupeKey(event);
    if (!key) {
      return { ok: true, key: null, duplicate: false };
    }
    if (seen.has(key)) {
      logger.info?.(`[${name}] duplicate ignored`, key);
      return { ok: false, key, duplicate: true };
    }
    seen.add(key);
    return { ok: true, key, duplicate: false };
  }

  return {
    shouldProcess
  };
}

export {
  createEventConsumerGuard
};
