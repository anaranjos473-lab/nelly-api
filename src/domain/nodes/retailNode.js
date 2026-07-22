import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildRetailFulfillmentNode({
  id = `retail_${Date.now()}`,
  zona = 'general',
  capabilities = ['storefront', 'picking', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'retail',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'retail',
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
  buildRetailFulfillmentNode
};
