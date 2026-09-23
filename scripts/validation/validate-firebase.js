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

const securityRulesPath = path.join(ROOT, 'security_rules.json');
if (fs.existsSync(securityRulesPath)) {
  const securityRules = JSON.parse(fs.readFileSync(securityRulesPath, 'utf8'));
  const pedidos = securityRules?.rules?.pedidos;
  if (!pedidos || pedidos['.read'] !== 'auth != null') {
    console.error('security_rules.json debe requerir autenticacion para leer pedidos');
    ok = false;
  }
  if (!pedidos || pedidos['.write'] !== false || pedidos?.$pedido_id?.['.write'] !== false) {
    console.error('security_rules.json debe impedir escrituras directas de clientes en pedidos');
    ok = false;
  }
  if (!Array.isArray(pedidos?.['.indexOn']) || !pedidos['.indexOn'].includes('estado')) {
    console.error('security_rules.json debe indexar pedidos.estado');
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-firebase: OK');
