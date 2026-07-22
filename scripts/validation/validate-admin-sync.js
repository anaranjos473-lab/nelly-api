import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const TARGET = path.join(ROOT, 'src', 'services', 'adminSyncService.js');
const REQUIRED = ['buildAdminOrderPayload'];

function main() {
  if (!fs.existsSync(TARGET)) {
    throw new Error(`No existe el servicio de sincronizacion admin: ${TARGET}`);
  }

  const content = fs.readFileSync(TARGET, 'utf8');
  const missing = REQUIRED.filter((snippet) => !content.includes(snippet));
  const report = { ok: missing.length === 0, target: path.relative(ROOT, TARGET), missing };
  console.log(JSON.stringify(report, null, 2));
  if (missing.length > 0) process.exit(1);
}

main();
