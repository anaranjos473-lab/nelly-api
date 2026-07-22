import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildSortationCenterFulfillmentNode({
  id = `sortation_center_${Date.now()}`,
  zona = 'general',
  capabilities = ['sorting', 'consolidation', 'dispatch', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'sortation_center',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'sortation_center',
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
  buildSortationCenterFulfillmentNode
};
