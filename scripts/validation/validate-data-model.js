import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const file = path.join(ROOT, 'DATA_MODEL.md');

if (!fs.existsSync(file)) {
  console.error('DATA_MODEL.md no existe');
  process.exit(1);
}

const content = fs.readFileSync(file, 'utf8');
const required = [
  'repartidores/{uid}',
  'repartidores_activos/{uid}',
  'pedidos/{pedidoId}',
  'finanzas',
  'historial_ventas'
];

let ok = true;
for (const item of required) {
  if (!content.includes(item)) {
    console.error(`DATA_MODEL.md no contiene: ${item}`);
    ok = false;
  }
}

if (!content.includes('fuente canónica') && !content.includes('fuente canonica')) {
  console.error('DATA_MODEL.md debe declarar una fuente canónica');
  ok = false;
}

if (!ok) {
  process.exit(1);
}

console.log('validate-data-model: OK');
