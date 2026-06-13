import { getAdmin } from './config/firebase-admin-esm.js'; 
const admin = await getAdmin(); 
const db = admin.database(); 
const snap = await db.ref('pedidos/-Ov02__SKyxR5umEaska').get(); 
console.log('exists=', snap.exists()); 
console.log(JSON.stringify(snap.val(), null, 2)); 
