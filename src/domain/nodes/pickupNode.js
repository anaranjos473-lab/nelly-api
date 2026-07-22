import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildPickupFulfillmentNode({
  id = `pickup_${Date.now()}`,
  zona = 'general',
  capabilities = ['collection', 'handoff', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'pickup',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'pickup',
      mode: 'fulfillment'
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
  buildPickupFulfillmentNode
};
