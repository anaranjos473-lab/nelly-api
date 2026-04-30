// scripts/valida_repartidor_estado.js
// Valida PATCH y consulta en Firebase RTDB

import fetch from 'node-fetch';
import admin from 'firebase-admin';
import fs from 'fs';

const API_URL = 'https://nelly-api-8lh1.onrender.com/api/repartidores/estado';
const TEST_UID = 'test_repartidor_001';
const PATCH_BODY = {
  uid: TEST_UID,
  disponible: true,
  lat: 16.7528,
  lng: -93.1167,
  bateria: 85
};

// --- 1. PATCH al endpoint ---
async function patchEstado() {
  const res = await fetch(API_URL, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(PATCH_BODY)
  });
  const data = await res.json();
  console.log('Respuesta PATCH:', data);
  return data.success === true;
}

// --- 2. Consulta en Firebase RTDB ---
function getServiceAccount() {
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  if (fs.existsSync('./nelly-admin.json')) {
    return JSON.parse(fs.readFileSync('./nelly-admin.json', 'utf8'));
  }
  throw new Error('No se encontró credencial de Firebase');
}

async function consultaFirebase() {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(getServiceAccount()),
      databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
    });
  }
  const db = admin.database();
  const ref = db.ref('repartidores/' + TEST_UID);
  const snap = await ref.once('value');
  const val = snap.val();
  console.log('Nodo en Firebase:', val);
  return val && val.meta && val.meta.bateria === 85;
}

// --- Ejecución principal ---
(async () => {
  const okPatch = await patchEstado();
  if (!okPatch) {
    console.error('❌ PATCH falló');
    process.exit(1);
  }
  const okFirebase = await consultaFirebase();
  if (!okFirebase) {
    console.error('❌ Firebase no refleja el cambio');
    process.exit(2);
  }
  console.log('✅ Validación completa: PATCH y Firebase OK');
  process.exit(0);
})();
