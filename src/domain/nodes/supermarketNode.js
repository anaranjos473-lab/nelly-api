import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildSupermarketFulfillmentNode({
  id = `supermarket_${Date.now()}`,
  zona = 'general',
  capabilities = ['picking', 'packing', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'supermarket',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'supermarket',
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
  buildSupermarketFulfillmentNode
};
