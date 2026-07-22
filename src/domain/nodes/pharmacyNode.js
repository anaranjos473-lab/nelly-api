import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildPharmacyFulfillmentNode({
  id = `pharmacy_${Date.now()}`,
  zona = 'general',
  capabilities = ['dispensacion', 'preparacion', 'seguimiento'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'pharmacy',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'pharmacy',
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
  buildPharmacyFulfillmentNode
};
