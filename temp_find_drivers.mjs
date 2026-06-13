import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const snap = await db.ref('repartidores').once('value');
const drivers = snap.val() || {};
const results = [];
for (const [uid, driver] of Object.entries(drivers)) {
  const capitalDisponible = [
    driver?.billetera?.capital_disponible,
    driver?.billetera?.efectivo_disponible,
    driver?.finanzas?.capital_disponible,
    driver?.finanzas?.efectivo_disponible
  ].map(v=>Number(v)).filter(n=>Number.isFinite(n));
  const billeteraGuerra = [
    driver?.billetera_guerra,
    driver?.billetera?.billetera_guerra,
    driver?.finanzas?.billetera_guerra,
    driver?.perfil?.billetera_guerra
  ].map(v=>Number(v)).find(n=>Number.isFinite(n));
  results.push({ uid, billeteraGuerra: billeteraGuerra || 0, capitalDisponible: capitalDisponible.length ? capitalDisponible[0] : 0, ubicacion: driver?.ubicacion || null, perfil: driver?.perfil || null });
}
const filtered = results.filter(d => d.billeteraGuerra >= 100 || d.capitalDisponible >= 100);
console.log('candidates=' + filtered.length);
console.log(JSON.stringify(filtered.slice(0, 20), null, 2));
