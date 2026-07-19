import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const contracts = [
  'docs/contracts/ACCEPT_ORDER.md',
  'docs/contracts/COMPLETE_ORDER.md',
  'docs/contracts/DRIVER_TOKEN.md',
  'docs/contracts/UPDATE_LOCATION.md'
];

const mustHave = [
  '#',
  '## Objetivo',
  '## Endpoint',
  '## Request',
  '## Response',
  '## Validaciones',
  '## Códigos de Error',
  '## Invariantes',
  '## Dependencias',
  '## Casos de Prueba',
  '## Historial de Cambios'
];

let ok = true;
for (const rel of contracts) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`Falta contrato: ${rel}`);
    ok = false;
    continue;
  }

  const content = fs.readFileSync(full, 'utf8');
  for (const section of mustHave) {
    if (!content.includes(section)) {
      console.error(`Falta sección "${section}" en ${rel}`);
      ok = false;
    }
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-contracts: OK');
