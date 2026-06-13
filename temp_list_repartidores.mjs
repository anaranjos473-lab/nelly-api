import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const snap = await db.ref('repartidores').once('value');
const val = snap.val();
if (!val) { console.log('count=0'); process.exit(0); }
const keys = Object.keys(val).slice(0, 20);
console.log('count=' + keys.length);
for (const k of keys) {
  console.log('KEY=' + k + ' STATUS=' + JSON.stringify(val[k]?.estatus || val[k]?.perfil || val[k]?.pedido_activo || null));
}
