import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'src', 'services', 'agentSyncService.js');

const REQUIRED = [
  'buildSupportInterventionPayload',
  'buildSupportRescuePayload',
  'buildDispatchAssignmentPayload'
];

function main() {
  if (!fs.existsSync(TARGET)) {
    throw new Error(`No existe el servicio de sincronizacion de agentes: ${TARGET}`);
  }

  const content = fs.readFileSync(TARGET, 'utf8');
  const missing = REQUIRED.filter((item) => !content.includes(item));
  const report = { ok: missing.length === 0, target: path.relative(ROOT, TARGET), missing };
  console.log(JSON.stringify(report, null, 2));
  if (missing.length > 0) process.exit(1);
}

main();
