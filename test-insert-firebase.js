// test-insert-firebase.js
// Inserta un pedido de ejemplo en Firestore y un conductor en RTDB


import { getAdmin } from './config/firebase-admin-esm.js';

let db, rtdb;


async function main() {
  const admin = await getAdmin();
  db = admin.firestore();
  rtdb = admin.database();

  // Insertar conductor activo
  await rtdb.ref('conductores_activos/juan').set({
    lat: 16.754,
    lng: -93.116,
    estado: 'DISPONIBLE'
  });
  console.log('Conductor juan insertado en RTDB');

  // Insertar pedido pendiente
  const pedidoRef = await db.collection('pedidos').add({
    latTienda: 16.753,
    lngTienda: -93.115,
    estado: 'PENDIENTE',
    cliente: 'prueba',
    timestamp: new Date()
  });
  console.log('Pedido de prueba insertado en Firestore con ID:', pedidoRef.id);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
