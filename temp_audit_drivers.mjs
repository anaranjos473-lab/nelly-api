import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const snap = await db.ref('repartidores').once('value');
const repartidores = snap.val() || {};
const candidatos = [];
for (const [uid, driver] of Object.entries(repartidores)) {
  const capitalDisponible = [
    driver?.billetera?.capital_disponible,
    driver?.billetera?.efectivo_disponible,
    driver?.finanzas?.capital_disponible,
    driver?.finanzas?.efectivo_disponible,
  ].map((v) => (v === undefined || v === null ? NaN : Number(v))).find(Number.isFinite);
  const billeteraGuerra = [
    driver?.billetera_guerra,
    driver?.billetera?.billetera_guerra,
    driver?.finanzas?.billetera_guerra,
    driver?.perfil?.billetera_guerra
  ].map((v) => (v === undefined || v === null ? NaN : Number(v))).find(Number.isFinite);
  if ((Number.isFinite(capitalDisponible) && capitalDisponible > 300) || (Number.isFinite(billeteraGuerra) && billeteraGuerra > 300)) {
    candidatos.push({ uid, capitalDisponible, billeteraGuerra, nivel: driver?.estatus?.nivel || driver?.nivel || null, deuda: driver?.finanzas?.deuda_actual || driver?.billetera?.deuda_comision || null });
  }
}
console.log(JSON.stringify({ total: Object.keys(repartidores).length, candidatos }, null, 2));
