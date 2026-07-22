import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildMerchantFulfillmentNodeEntry({
  id = `merchant_fulfillment_${Date.now()}`,
  zona = 'general',
  capabilities = ['order_fulfillment', 'inventory_visibility', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'merchant_fulfillment',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'merchant_fulfillment',
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
  buildMerchantFulfillmentNodeEntry
};
