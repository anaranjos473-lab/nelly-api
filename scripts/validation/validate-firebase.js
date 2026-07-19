import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = ['firebase.json', 'security_rules.json', 'database.rules.json'];
let ok = true;

for (const rel of files) {
  const full = path.join(ROOT, rel);
  if (!fs.existsSync(full)) {
    console.error(`Falta archivo Firebase: ${rel}`);
    ok = false;
  }
}

if (fs.existsSync(path.join(ROOT, 'firebase.json'))) {
  const firebase = JSON.parse(fs.readFileSync(path.join(ROOT, 'firebase.json'), 'utf8'));
  if (!firebase.database || !firebase.database.rules) {
    console.error('firebase.json debe declarar rules de database');
    ok = false;
  }
  if (!firebase.hosting || !firebase.hosting.public) {
    console.error('firebase.json debe declarar hosting.public');
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-firebase: OK');
