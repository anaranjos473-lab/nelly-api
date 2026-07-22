import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildMerchantFulfillmentNode({
  id = `merchant_${Date.now()}`,
  zona = 'general',
  capabilities = ['catalog', 'availability', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'merchant',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'merchant',
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
  buildMerchantFulfillmentNode
};
