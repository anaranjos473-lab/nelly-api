import { FULFILLMENT_NODE_CONTRACT, validateFulfillmentNode } from '../contracts/fulfillmentNode.js';
import { FULFILLMENT_NODE_STATES } from '../enums.js';

function buildCargoFulfillmentNode({
  id = `cargo_${Date.now()}`,
  zona = 'general',
  capabilities = ['receiving', 'sorting', 'handoff'],
  metadata = {}
} = {}) {
  const node = {
    id,
    tipo: 'cargo',
    estado: FULFILLMENT_NODE_STATES.DISPONIBLE,
    capabilities,
    metadata: {
      ...metadata,
      specialty: 'cargo',
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
  buildCargoFulfillmentNode
};
