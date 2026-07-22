import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildHandoffPointFulfillmentNode({
  id = `handoff_point_${Date.now()}`,
  zona = 'general',
  capabilities = ['handoff', 'tracking', 'transfer'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'handoff_point',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'handoff_point',
      mode: 'bridge'
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
  buildHandoffPointFulfillmentNode
};
