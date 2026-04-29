// scripts/monitor-api.js
import fetch from 'node-fetch';

const BASE_URL = process.env.NELLY_API_URL || 'https://nelly-api.onrender.com';
const endpoints = [
  '/api/health',
  '/api/usuarios',
  '/api/ordenes',
  '/api/zonas',
  '/api-docs'
];

async function checkEndpoint(path) {
  try {
    const res = await fetch(BASE_URL + path);
    const status = res.status;
    let body = '';
    try { body = await res.text(); } catch {}
    console.log(`${path}: ${status} ${body.length > 100 ? body.slice(0, 100) + '...' : body}`);
    return status === 200 || status === 201;
  } catch (err) {
    console.error(`${path}: ERROR`, err.message);
    return false;
  }
}

(async () => {
  console.log(`Monitoreando API: ${BASE_URL}`);
  let ok = true;
  for (const ep of endpoints) {
    const res = await checkEndpoint(ep);
    if (!res) ok = false;
  }
  if (ok) {
    console.log('✅ Todos los endpoints principales responden correctamente.');
    process.exit(0);
  } else {
    console.log('❌ Algún endpoint falló. Revisa los logs y la configuración.');
    process.exit(1);
  }
})();
