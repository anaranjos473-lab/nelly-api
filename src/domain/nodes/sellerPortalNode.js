import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildSellerPortalFulfillmentNode({
  id = `seller_portal_${Date.now()}`,
  zona = 'general',
  capabilities = ['catalog', 'pricing', 'availability', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'seller_portal',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'seller_portal',
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
  buildSellerPortalFulfillmentNode
};
