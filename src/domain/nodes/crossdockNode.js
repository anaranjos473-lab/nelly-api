import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildCrossdockFulfillmentNode({
  id = `crossdock_${Date.now()}`,
  zona = 'general',
  capabilities = ['transfer', 'sorting', 'dispatch', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'crossdock',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'crossdock',
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
  buildCrossdockFulfillmentNode
};
