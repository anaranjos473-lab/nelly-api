import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const adrFiles = [
  'docs/adr/README.md',
  'docs/adr/ADR-002-DATA_MODEL.md',
  'docs/adr/ADR-003-RADAR_DRIVER.md',
  'docs/adr/ADR-004-COMPLETE_ORDER.md',
  'docs/adr/ADR-005-FINANZAS.md',
  'docs/adr/ADR-006-AUTHENTICATION.md'
];

let ok = true;
for (const rel of adrFiles) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`Missing ADR file: ${rel}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('adr-check: OK');
