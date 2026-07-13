import { validateOrderV2, buildShadowMetrics } from './c5ShadowValidator.js';

function logStructured(logger, level, payload) {
  const method = typeof logger?.[level] === 'function' ? logger[level].bind(logger) : console.log;
  method(`[C5_SHADOW] ${JSON.stringify(payload)}`);
}

export async function startC5ShadowObserver({
  db,
  enabled = false,
  observationId = null,
  logger = console,
  now = () => Date.now()
} = {}) {
  const results = new Map();
  const stateById = new Map();
  let validationRuns = 0;
  let invalidTransitionEvents = 0;

  const controller = {
    enabled: enabled === true,
    getMetrics: () => buildShadowMetrics(results, {
      validationRuns,
      invalidTransitionEvents,
      generatedAt: now(),
      observationId
    }),
    stop: () => {}
  };

  if (!enabled) return controller;
  if (!/^[A-Z0-9][A-Z0-9_-]{2,63}$/.test(String(observationId || ''))) {
    throw new Error('C5 Shadow Validator requiere C5_SHADOW_OBSERVATION_ID válido');
  }
  if (!db || typeof db.ref !== 'function') throw new Error('C5 Shadow Validator requiere una instancia RTDB');

  const pedidosRef = db.ref('pedidos');
  const emit = (level, payload) => logStructured(logger, level, {
    observation_id: observationId,
    ...payload
  });

  const validateSnapshot = (id, order, previousState = undefined, source = 'change') => {
    const previousEntry = results.get(id);
    const result = validateOrderV2(order, { key: id, previousState });
    const signature = JSON.stringify({
      valid: result.valid,
      errors: result.errors.map(({ code, path }) => [code, path]),
      aliases: result.aliasesUsed.map(({ alias }) => alias),
      estado: order?.estado ?? null,
      fase: order?.logistica?.fase_operativa ?? null,
      contract_version: order?.contract_version ?? null,
      producer: order?.producer || order?.origen || 'NO_DECLARADO'
    });
    validationRuns += 1;
    if (previousState !== undefined && result.errors.some((error) => error.code === 'TRANSICION_INVALIDA' && error.path === 'estado')) {
      invalidTransitionEvents += 1;
    }
    results.set(id, { result, producer: order?.producer || order?.origen || 'NO_DECLARADO', signature });
    stateById.set(id, order?.estado ?? null);

    if (source !== 'initial' && signature !== previousEntry?.signature) {
      emit(result.valid ? 'info' : 'warn', {
        event: 'order_validation',
        source,
        pedido_id: id,
        contract_version: order?.contract_version ?? null,
        producer: order?.producer || order?.origen || 'NO_DECLARADO',
        valid: result.valid,
        failure_codes: [...new Set(result.errors.map((error) => error.code))],
        aliases: [...new Set(result.aliasesUsed.map((alias) => alias.alias))]
      });
      emit('info', { event: 'metrics', ...controller.getMetrics() });
    }
  };

  const initialSnapshot = await pedidosRef.once('value');
  const initialOrders = initialSnapshot?.val?.() || {};
  for (const [id, order] of Object.entries(initialOrders)) validateSnapshot(id, order, undefined, 'initial');

  emit('info', { event: 'initial_metrics', ...controller.getMetrics() });

  const onAdded = (snapshot) => {
    const id = snapshot?.key;
    if (!id || stateById.has(id)) return;
    validateSnapshot(id, snapshot.val(), undefined, 'child_added');
  };
  const onChanged = (snapshot) => {
    const id = snapshot?.key;
    if (!id) return;
    validateSnapshot(id, snapshot.val(), stateById.get(id), 'child_changed');
  };
  const onRemoved = (snapshot) => {
    const id = snapshot?.key;
    if (!id) return;
    results.delete(id);
    stateById.delete(id);
    emit('info', { event: 'child_removed', pedido_id: id });
    emit('info', { event: 'metrics', ...controller.getMetrics() });
  };
  const onError = (error) => emit('error', {
    event: 'listener_error',
    message: String(error?.message || error || 'unknown').slice(0, 240)
  });

  pedidosRef.on('child_added', onAdded, onError);
  pedidosRef.on('child_changed', onChanged, onError);
  pedidosRef.on('child_removed', onRemoved, onError);

  controller.stop = () => {
    pedidosRef.off('child_added', onAdded);
    pedidosRef.off('child_changed', onChanged);
    pedidosRef.off('child_removed', onRemoved);
    emit('info', { event: 'stopped' });
  };

  return controller;
}
