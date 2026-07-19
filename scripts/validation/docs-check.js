import fs from 'fs';
import path from 'path';

const required = [
  'AGENTS.md',
  'README.md',
  'DATA_MODEL.md',
  'SYSTEM_STATE.md',
  'CHANGELOG.md',
  'CONTRIBUTING.md',
  'ENGINEERING_PRINCIPLES.md',
  'DEPENDENCY_MAP.md',
  'RELEASE_CHECKLIST.md',
  'PROJECT_GLOSSARY.md',
  'NELLY_OS_MANIFEST.md',
  'ARCHITECTURE.svg'
];

let ok = true;
for (const rel of required) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.error(`Missing root doc: ${rel}`);
    ok = false;
  }
}

const docDirs = [
  'docs/adr/README.md',
  'docs/contracts/README.md',
  'docs/certificaciones/README.md',
  'docs/investigaciones/README.md',
  'docs/runbooks/README.md'
];

for (const rel of docDirs) {
  if (!fs.existsSync(path.join(process.cwd(), rel))) {
    console.error(`Missing docs index: ${rel}`);
    ok = false;
  }
}

if (!ok) process.exit(1);
console.log('docs-check: OK');
