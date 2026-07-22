import {
  DOMAIN_EVENT_CONTRACT,
  EVIDENCE_CONTRACT,
  FULFILLMENT_NODE_CONTRACT,
  INVENTORY_ITEM_CONTRACT,
  LEDGER_ENTRY_CONTRACT,
  ORDER_CONTRACT,
  ORDER_ITEM_CONTRACT,
  PAYMENT_CONTRACT,
  SHIPMENT_CONTRACT
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

let ok = true;
const versions = new Map();

for (const contract of contracts) {
  if (!contract?.name || !contract?.version) {
    console.error('Contrato incompleto detectado');
    ok = false;
    continue;
  }
  const current = versions.get(contract.name);
  if (current && current !== contract.version) {
    console.error(`Version inconsistente para ${contract.name}: ${current} vs ${contract.version}`);
    ok = false;
  }
  versions.set(contract.name, contract.version);
}

if (!ok) {
  process.exit(1);
}

console.log('validate-contract-compatibility: OK');
