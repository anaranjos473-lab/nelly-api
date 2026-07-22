import { FULFILLMENT_NODE_STATES } from '../enums.js';
import { buildContract, validateRequiredFields } from './helpers.js';

const FULFILLMENT_NODE_CONTRACT = buildContract(
  'FulfillmentNode',
  '1.0.0',
  'fulfillment_node',
  ['id', 'tipo', 'estado', 'capabilities'],
  ['metadata', 'zona'],
  [],
  Object.values(FULFILLMENT_NODE_STATES)
);

function validateFulfillmentNode(node = {}) {
  const result = validateRequiredFields(FULFILLMENT_NODE_CONTRACT, node);
  return result.ok ? { ok: true, contract: FULFILLMENT_NODE_CONTRACT } : { ok: false, contract: FULFILLMENT_NODE_CONTRACT, missing: result.missing };
}

export { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode };
