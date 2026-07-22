import {
  DOMAIN_EVENT_CONTRACT,
  EVIDENCE_CONTRACT,
  FULFILLMENT_NODE_CONTRACT,
  INVENTORY_ITEM_CONTRACT,
  LEDGER_ENTRY_CONTRACT,
  ORDER_CONTRACT,
  ORDER_ITEM_CONTRACT,
  PAYMENT_CONTRACT,
  SHIPMENT_CONTRACT,
  validateDomainEvent,
  validateEvidence,
  validateFulfillmentNode,
  validateInventoryItem,
  validateLedgerEntry,
  validateOrder,
  validateOrderItem,
  validatePayment,
  validateShipment
} from '../../src/domain/index.js';

const contracts = [
  ORDER_CONTRACT,
  ORDER_ITEM_CONTRACT,
  FULFILLMENT_NODE_CONTRACT,
  INVENTORY_ITEM_CONTRACT,
  LEDGER_ENTRY_CONTRACT,
  PAYMENT_CONTRACT,
  SHIPMENT_CONTRACT,
  DOMAIN_EVENT_CONTRACT,
  EVIDENCE_CONTRACT
];

const validators = [
  [validateOrder, { id: 'ORD-1', cliente: 'c1', lineas: [], estado: 'CREADO', created_at: 1, updated_at: 1 }],
  [validateOrderItem, { id: 'IT-1', pedido_id: 'ORD-1', producto_id: 'SKU-1', cantidad: 1, precio_unitario: 10 }],
  [validateFulfillmentNode, { id: 'NODE-1', tipo: 'kitchen', estado: 'DISPONIBLE', capabilities: [] }],
  [validateInventoryItem, { id: 'INV-1', sku: 'SKU-1', nodo_id: 'NODE-1', disponible: 10, reservado: 0 }],
  [validateLedgerEntry, { id: 'LED-1', tipo: 'cargo', monto: 10, moneda: 'MXN', referencia_id: 'ORD-1', ocurrido_en: 1 }],
  [validatePayment, { id: 'PAY-1', pedido_id: 'ORD-1', metodo: 'cash', estado: 'CONFIRMADO', monto: 10 }],
  [validateShipment, { id: 'SHP-1', pedido_id: 'ORD-1', repartidor_id: 'DRV-1', estado: 'EN_TRANSITO' }],
  [validateDomainEvent, { id: 'EVT-1', tipo: 'pedido.creado', aggregate_id: 'ORD-1', ocurrido_en: 1, registrado_en: 1 }],
  [validateEvidence, { id: 'EVD-1', tipo: 'captura', url: 'https://example.test/evidence.png', timestamp: 1 }]
];

let ok = true;

for (const contract of contracts) {
  if (!Object.isFrozen(contract)) {
    console.error(`Contrato no congelado: ${contract?.name || 'desconocido'}`);
    ok = false;
  }
  if (!contract?.version || !contract?.entity || !Array.isArray(contract?.requiredFields)) {
    console.error(`Contrato incompleto: ${contract?.name || 'desconocido'}`);
    ok = false;
  }
}

for (const [validator, sample] of validators) {
  const result = validator(sample);
  if (!result.ok) {
    console.error(`Validador fallo para ${result.contract?.name || 'contrato'}: ${result.missing?.join(', ') || 'sin detalle'}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-domain-contracts: OK');
