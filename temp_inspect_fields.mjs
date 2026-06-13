import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const snap = await db.ref('repartidores').once('value');
const repartidores = snap.val() || {};
function findKeys(obj, prefix = '') {
  if (obj === null || obj === undefined) return [];
  if (typeof obj !== 'object') return [];
  const matches = [];
  for (const [key, value] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (/capital|billetera|deuda|finanzas|efectivo|reservas|estatus|perfil/i.test(key)) {
      matches.push(path);
    }
    if (typeof value === 'object' && value !== null) {
      matches.push(...findKeys(value, path));
    }
  }
  return matches;
}
const result = {};
for (const [uid, driver] of Object.entries(repartidores)) {
  result[uid] = findKeys(driver).sort();
}
console.log(JSON.stringify(result, null, 2));
