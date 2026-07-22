import { DOMAIN_EVENT_TYPES } from '../enums.js';
import { buildContract, validateRequiredFields } from './helpers.js';

const DOMAIN_EVENT_CONTRACT = buildContract(
  'DomainEvent',
  '1.0.0',
  'domain_event',
  ['id', 'tipo', 'aggregate_id', 'ocurrido_en', 'registrado_en'],
  ['metadata', 'payload', 'correlation_id', 'causation_id'],
  [],
  Object.values(DOMAIN_EVENT_TYPES)
);

function validateDomainEvent(event = {}) {
  const result = validateRequiredFields(DOMAIN_EVENT_CONTRACT, event);
  return result.ok ? { ok: true, contract: DOMAIN_EVENT_CONTRACT } : { ok: false, contract: DOMAIN_EVENT_CONTRACT, missing: result.missing };
}

export { DOMAIN_EVENT_CONTRACT, validateDomainEvent };
