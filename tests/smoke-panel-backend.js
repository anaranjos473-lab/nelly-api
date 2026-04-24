// tests/smoke-panel-backend.js
require('dotenv').config();
const fetch = require('node-fetch');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';

async function smokeTest() {
  const endpoints = [
    '/api/liquidaciones',
    '/api/panel/finanzas/registrar-pago-deuda',
    '/api/healthcheck',
    '/api/admin/repartidores',
  ];
  let passed = 0;
  for (const path of endpoints) {
    try {
      const res = await fetch(BASE_URL + path, { method: 'GET' });
      if (res.status === 200 || res.status === 401 || res.status === 403) {
        console.log(`[SMOKE] ${path} OK (${res.status})`);
        passed++;
      } else {
        console.error(`[SMOKE] ${path} FAIL (${res.status})`);
      }
    } catch (e) {
      console.error(`[SMOKE] ${path} ERROR:`, e.message);
    }
  }
  if (passed === endpoints.length) {
    console.log('[SMOKE] Todos los endpoints críticos responden');
    process.exit(0);
  } else {
    console.error('[SMOKE] Falla en uno o más endpoints');
    process.exit(1);
  }
}

smokeTest();
