import { getAdmin } from './config/firebase-admin-esm.js';
const admin = await getAdmin();
const db = admin.database();
const driverId = 'driver_123';
const pedidoId = 'AUTO_1776641400683';
const driverSnap = await db.ref(`repartidores/${driverId}`).once('value');
const pedidoSnap = await db.ref(`pedidos_para_reparto/${pedidoId}`).once('value');
console.log('driver=' + JSON.stringify(driverSnap.val(), null, 2));
console.log('pedido=' + JSON.stringify(pedidoSnap.val(), null, 2));
