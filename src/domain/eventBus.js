import { DOMAIN_EVENT_CONTRACT, validateDomainEvent } from './contracts/domainEvent.js';
import { getStateEvent, normalizeState } from './stateMachine.js';

function createEventId(prefix = 'evt') {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function createDomainEvent({
  tipo,
  aggregate_id,
  payload = {},
  source = 'domain',
  actor = null,
  correlation_id = null,
  causation_id = null,
  version = DOMAIN_EVENT_CONTRACT.version,
  id = createEventId()
} = {}) {
  const now = Date.now();
  const event = {
    id,
    tipo,
    aggregate_id,
    ocurrido_en: now,
    registrado_en: now,
    metadata: {
      source,
      contract_version: version
    },
    payload,
    correlation_id,
    causation_id,
    actor: actor
      ? {
          tipo: actor.tipo || 'system',
          uid: actor.uid || 'system'
        }
      : undefined
  };

  const validation = validateDomainEvent(event);
  return {
    ...event,
    validation
  };
}

function createDomainEventBus() {
  const listeners = new Map();
  const history = [];

  function subscribe(tipo, handler) {
    const key = String(tipo || '*');
    if (!listeners.has(key)) {
      listeners.set(key, new Set());
    }
    listeners.get(key).add(handler);
    return () => {
      listeners.get(key)?.delete(handler);
    };
  }

  function publish(event) {
    const wrapped = { ...event };
    history.push(wrapped);
    const errors = [];
    const targets = [
      ...(listeners.get(String(wrapped.tipo || '')) || []),
      ...(listeners.get('*') || [])
    ];
    for (const handler of targets) {
      try {
        handler(wrapped);
      } catch (error) {
        errors.push(error);
      }
    }
    if (errors.length > 0) {
      wrapped.errors = errors.map((error) => ({
        message: String(error?.message || error || 'unknown'),
        name: error?.name || 'Error'
      }));
    }
    return wrapped;
  }

  function emit(tipo, detail = {}) {
    const event = createDomainEvent({ tipo, ...detail });
    return publish(event);
  }

  function recordTransition({
    aggregate_id,
    from,
    to,
    payload = {},
    actor = null,
    source = 'state-machine',
    correlation_id = null,
    causation_id = null
  } = {}) {
    const normalizedFrom = normalizeState(from);
    const normalizedTo = normalizeState(to);
    const tipo = getStateEvent(normalizedTo);
    if (!tipo) {
      throw new Error(`No existe evento de dominio para el estado ${normalizedTo}`);
    }
    return emit(tipo, {
      aggregate_id,
      payload: {
        from: normalizedFrom,
        to: normalizedTo,
        ...payload
      },
      source,
      actor,
      correlation_id,
      causation_id
    });
  }

  function getHistory() {
    return [...history];
  }

  return {
    subscribe,
    publish,
    emit,
    recordTransition,
    getHistory
  };
}

export {
  createDomainEvent,
  createDomainEventBus
};
