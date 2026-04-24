// tests/validate-nomina.js
require('dotenv').config();
const fetch = require('node-fetch');
const admin = require('firebase-admin');

const BASE_URL = process.env.BASE_URL || 'http://localhost:3001';
const UID = process.env.UID;
const MONTO = Number(process.env.MONTO || 100);
const FIREBASE_ADMIN_JSON = process.env.FIREBASE_ADMIN_JSON;

if (!UID || !FIREBASE_ADMIN_JSON) {
  console.error('Faltan variables de entorno: UID y/o FIREBASE_ADMIN_JSON');
  process.exit(1);
}

async function getIdToken() {
  if (admin.apps.length === 0) {
    const serviceAccount = JSON.parse(
      FIREBASE_ADMIN_JSON.trim().startsWith('{')
        ? FIREBASE_ADMIN_JSON
        : Buffer.from(FIREBASE_ADMIN_JSON, 'base64').toString('utf8')
    );
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
    });
  }
  // Usuario de pruebas debe existir en Firebase Auth
  return await admin.auth().createCustomToken(UID, { admin: true, role: 'panel_cocina' });
}

async function fetchLiquidaciones(idToken) {
  const res = await fetch(`${BASE_URL}/api/liquidaciones`, {
    headers: { Authorization: `Bearer ${idToken}` },
  });
  return res.json();
}

async function postPago(idToken) {
  const res = await fetch(`${BASE_URL}/api/panel/finanzas/registrar-pago-deuda`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
    },
    body: JSON.stringify({ uid: UID, monto_pago: MONTO }),
  });
  return res.json();
}

(async () => {
  try {
    const idToken = await getIdToken();
    console.log('[CI] Token generado');
    const antes = await fetchLiquidaciones(idToken);
    console.log('[CI] Liquidaciones antes:', antes);
    const pago = await postPago(idToken);
    console.log('[CI] Resultado pago:', pago);
    const despues = await fetchLiquidaciones(idToken);
    console.log('[CI] Liquidaciones después:', despues);
    if (pago.ok && pago.uid === UID) {
      console.log('[CI] Validación de nómina exitosa');
      process.exit(0);
    } else {
      console.error('[CI] Error en validación de nómina');
      process.exit(1);
    }
  } catch (e) {
    console.error('[CI] Error:', e.message);
    process.exit(1);
  }
})();
