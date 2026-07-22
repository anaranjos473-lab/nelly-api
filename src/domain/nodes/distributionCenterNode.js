import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildDistributionCenterFulfillmentNode({
  id = `distribution_center_${Date.now()}`,
  zona = 'general',
  capabilities = ['consolidation', 'sorting', 'dispatch', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'distribution_center',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'distribution_center',
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
  buildDistributionCenterFulfillmentNode
};
