import fs from 'fs';
import path from 'path';

const ROOT = process.cwd();
const files = [
  'routes/delivery.js',
  'routes/admin.js',
  'routes/panel.js',
  'routes/auth.js'
];

const requiredSnippets = [
  ['routes/delivery.js', "router.post('/accept-order'"],
  ['routes/delivery.js', "router.post('/complete-order'"],
  ['routes/delivery.js', "router.post('/update-location'"],
  ['routes/admin.js', "router.post('/repartidores/manual-lock'"],
  ['routes/admin.js', "router.get('/repartidores'"],
  ['routes/panel.js', "router.post('/finanzas/registrar-pago-deuda'"],
  ['routes/auth.js', "router.get('/driver-token'"]
];

let ok = true;

for (const file of files) {
  if (!fs.existsSync(path.join(ROOT, file))) {
    console.error(`Falta archivo requerido: ${file}`);
    ok = false;
  }
}

for (const [file, snippet] of requiredSnippets) {
  const full = path.join(ROOT, file);
  if (!fs.existsSync(full)) {
    continue;
  }
  const content = fs.readFileSync(full, 'utf8');
  if (!content.includes(snippet)) {
    console.error(`Falta snippet requerido en ${file}: ${snippet}`);
    ok = false;
  }
}

if (!ok) {
  process.exit(1);
}

console.log('validate-routes: OK');
