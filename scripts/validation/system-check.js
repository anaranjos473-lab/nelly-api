import fs from 'fs';
import path from 'path';

const files = [
  'AGENTS.md',
  'DATA_MODEL.md',
  'SYSTEM_STATE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md'
];

let ok = true;
for (const rel of files) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.error(`Missing system file: ${rel}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('system-check: OK');
