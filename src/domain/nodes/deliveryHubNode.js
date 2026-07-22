import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildDeliveryHubFulfillmentNode({
  id = `delivery_hub_${Date.now()}`,
  zona = 'general',
  capabilities = ['consolidation', 'sorting', 'dispatch', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'delivery_hub',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'delivery_hub',
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
  buildDeliveryHubFulfillmentNode
};
