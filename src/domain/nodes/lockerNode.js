import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildLockerFulfillmentNode({
  id = `locker_${Date.now()}`,
  zona = 'general',
  capabilities = ['dropoff', 'pickup', 'tracking'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'locker',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'locker',
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
  buildLockerFulfillmentNode
};
