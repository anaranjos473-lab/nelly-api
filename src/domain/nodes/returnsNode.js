import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildReturnsFulfillmentNode({
  id = `returns_${Date.now()}`,
  zona = 'general',
  capabilities = ['receiving', 'inspection', 'reassignment'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'returns',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'returns',
      mode: 'marketplace'
    },
    zona
  };

  return {
    contract: FULFILLMENT_NODE_CONTRACT,
    node,
    validation: validateFulfillmentNode(node)
  };
}

export {
  buildReturnsFulfillmentNode
};
