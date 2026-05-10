// test-antifraude-step1.js
// Paso 1: Crea el pedido en estado PENDIENTE y el conductor lejos
import { getAdmin } from './config/firebase-admin-esm.js';

async function main() {
  const admin = await getAdmin();
  const db = admin.firestore();
  const rtdb = admin.database();

  // 1. Crear un conductor con ubicación lejana
  await rtdb.ref('conductores_activos/juan').set({
    lat: 16.800,
    lng: -93.200,
    estado: 'DISPONIBLE'
  });
  console.log('Conductor juan insertado en RTDB (ubicación lejana)');

  // 2. Crear un pedido en estado PENDIENTE
  const pedidoRef = await db.collection('pedidos').add({
    latTienda: 16.753,
    lngTienda: -93.115,
    latCliente: 16.753,
    lngCliente: -93.115,
    estado: 'PENDIENTE',
    conductorId: 'juan',
    cliente: 'prueba',
    timestamp: new Date()
  });
  const pedidoId = pedidoRef.id;
  console.log('Pedido de prueba creado en Firestore con ID:', pedidoId);
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
