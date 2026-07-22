import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildPackageFulfillmentNode({
  id = `package_${Date.now()}`,
  zona = 'general',
  capabilities = ['sorting', 'tracking', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'package',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'package',
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
  buildPackageFulfillmentNode
};
