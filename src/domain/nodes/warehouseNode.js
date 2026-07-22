import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildWarehouseFulfillmentNode({
  id = `warehouse_${Date.now()}`,
  zona = 'general',
  capabilities = ['receiving', 'storage', 'dispatch'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'warehouse',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'warehouse',
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
  buildWarehouseFulfillmentNode
};
