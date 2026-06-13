import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const snap = await db.ref('pedidos_para_reparto').once('value');
const val = snap.val();
console.log('count=' + (val ? Object.keys(val).length : 0));
if (val) {
  const keys = Object.keys(val).slice(0, 10);
  for (const k of keys) {
    console.log('KEY=' + k + ' STATE=' + JSON.stringify((val[k].estado || val[k].estado_pedido || val[k].logistica?.estado || '').toString()));
  }
}
