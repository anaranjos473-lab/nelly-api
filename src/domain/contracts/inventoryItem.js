import { INVENTORY_ITEM_STATES } from '../enums.js';
import { buildContract, validateRequiredFields } from './helpers.js';

const INVENTORY_ITEM_CONTRACT = buildContract(
  'InventoryItem',
  '1.0.0',
  'inventory_item',
  ['id', 'sku', 'nodo_id', 'disponible', 'reservado'],
  ['metadata', 'ubicacion'],
  ['total'],
  Object.values(INVENTORY_ITEM_STATES)
);

function validateInventoryItem(item = {}) {
  const result = validateRequiredFields(INVENTORY_ITEM_CONTRACT, item);
  return result.ok ? { ok: true, contract: INVENTORY_ITEM_CONTRACT } : { ok: false, contract: INVENTORY_ITEM_CONTRACT, missing: result.missing };
}

export { INVENTORY_ITEM_CONTRACT, validateInventoryItem };
