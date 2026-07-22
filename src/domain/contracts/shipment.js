import { buildContract, validateRequiredFields } from './helpers.js';

const SHIPMENT_CONTRACT = buildContract(
  'Shipment',
  '1.0.0',
  'shipment',
  ['id', 'pedido_id', 'repartidor_id', 'estado'],
  ['metadata', 'tracking']
);

function validateShipment(shipment = {}) {
  const result = validateRequiredFields(SHIPMENT_CONTRACT, shipment);
  return result.ok ? { ok: true, contract: SHIPMENT_CONTRACT } : { ok: false, contract: SHIPMENT_CONTRACT, missing: result.missing };
}

export { SHIPMENT_CONTRACT, validateShipment };
