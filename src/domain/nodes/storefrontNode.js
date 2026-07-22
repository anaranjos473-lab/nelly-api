import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildStorefrontFulfillmentNode({
  id = `storefront_${Date.now()}`,
  zona = 'general',
  capabilities = ['catalog', 'availability', 'pricing', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'storefront',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'storefront',
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
  buildStorefrontFulfillmentNode
};
