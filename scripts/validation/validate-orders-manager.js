import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const target = path.join(ROOT, 'src/services/ordersManager.js');

if (!fs.existsSync(target)) {
  console.error('Falta src/services/ordersManager.js');
  process.exit(1);
}

const content = fs.readFileSync(target, 'utf8');
const requiredSnippets = [
  'function createOrdersManager',
  'function canAcceptOrder',
  'function canCompleteOrder',
  'function buildAcceptedOrderPayload',
  'function buildCompletedOrderPayload',
  'function buildDriverOfflinePayload',
  'function buildDriverOnlinePayload'
];

let ok = true;
for (const snippet of requiredSnippets) {
  if (!content.includes(snippet)) {
    console.error(`Falta snippet requerido: ${snippet}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-orders-manager: OK');
