// scripts/diagnostico-imports.js
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const rutas = [
  '../routes/admin.js',
  '../routes/pedidos.js',
  '../routes/repartidores.js',
  '../routes/zonas.js'
];

console.log('--- Diagnóstico de imports de rutas ---');

for (const ruta of rutas) {
  try {
    const url = new URL(ruta, import.meta.url);
    const modulo = await import(url);
    if (modulo && modulo.default) {
      console.log(`✅ ${ruta}: importación exitosa, export default encontrada.`);
    } else {
      console.error(`⚠️  ${ruta}: importado pero SIN export default.`);
    }
  } catch (err) {
    console.error(`❌ ${ruta}: ERROR de importación ->`, err.message);
  }
}

console.log('--- Fin del diagnóstico ---');
