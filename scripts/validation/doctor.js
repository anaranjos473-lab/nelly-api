import { spawnSync } from 'child_process';

const checks = [
  ['validate-routes', 'node', ['scripts/validation/validate-routes.js']],
  ['validate-data-model', 'node', ['scripts/validation/validate-data-model.js']],
  ['validate-contracts', 'node', ['scripts/validation/validate-contracts.js']],
  ['validate-firebase', 'node', ['scripts/validation/validate-firebase.js']],
  ['validate-orders-manager', 'node', ['scripts/validation/validate-orders-manager.js']],
  ['validate-domain-contracts', 'node', ['scripts/validation/validate-domain-contracts.js']],
  ['validate-domain-events', 'node', ['scripts/validation/validate-domain-events.js']],
  ['validate-ledger', 'node', ['scripts/validation/validate-ledger.js']],
  ['validate-order-model', 'node', ['scripts/validation/validate-order-model.js']],
  ['validate-contract-compatibility', 'node', ['scripts/validation/validate-contract-compatibility.js']],
  ['validate-event-integrity', 'node', ['scripts/validation/validate-event-integrity.js']],
  ['validate-fulfillment-engine', 'node', ['scripts/validation/validate-fulfillment-engine.js']],
  ['validate-order-sync', 'node', ['scripts/validation/validate-order-sync.js']],
  ['validate-agent-sync', 'node', ['scripts/validation/validate-agent-sync.js']],
  ['validate-sync-canonical', 'node', ['scripts/validation/validate-sync-canonical.js']],
  ['validate-admin-sync', 'node', ['scripts/validation/validate-admin-sync.js']],
  ['validate-pharmacy-node', 'node', ['scripts/validation/validate-pharmacy-node.js']],
  ['validate-supermarket-node', 'node', ['scripts/validation/validate-supermarket-node.js']],
  ['validate-package-node', 'node', ['scripts/validation/validate-package-node.js']],
  ['validate-functional-metrics', 'node', ['scripts/validation/validate-functional-metrics.js']],
  ['links-check', 'node', ['scripts/validation/links-check.js']],
  ['docs-check', 'node', ['scripts/validation/docs-check.js']],
  ['adr-check', 'node', ['scripts/validation/adr-check.js']],
  ['system-check', 'node', ['scripts/validation/system-check.js']]
];

const results = [];
let healthy = true;

for (const [name, cmd, args] of checks) {
  const result = spawnSync(cmd, args, {
    stdio: 'pipe',
    encoding: 'utf8',
    timeout: 30000,
    maxBuffer: 10 * 1024 * 1024
  });
  const ok = result.status === 0;
  results.push({
    name,
    ok,
    timeout: result.error?.code === 'ETIMEDOUT',
    output: (result.stdout || '').trim(),
    error: (result.stderr || '').trim()
  });
  if (!ok) healthy = false;
}

console.log('NELLY OS HEALTH REPORT');
console.log('');
for (const result of results) {
  console.log(`${result.name.padEnd(22, '.')} ${result.ok ? 'OK' : 'FAIL'}`);
  if (result.timeout) {
    console.log('  timeout after 30000ms');
  }
  if (!result.ok && result.error) {
    console.log(`  ${result.error.split('\n')[0]}`);
  }
}
console.log('');
console.log(`Overall ................ ${healthy ? 'HEALTHY' : 'UNHEALTHY'}`);

process.exit(healthy ? 0 : 1);
