// test-antifraude.js
// Simula un cambio de estado a 'ENTREGADO' para activar el agente antifraude
import { getAdmin } from './config/firebase-admin-esm.js';

async function main() {
  const admin = await getAdmin();
  const db = admin.firestore();
  const rtdb = admin.database();

  // 1. Crear un conductor con ubicación lejana (simula posible fraude)
  await rtdb.ref('conductores_activos/juan').set({
    lat: 16.800, // lejos del destino
    lng: -93.200,
    estado: 'DISPONIBLE'
  });
  console.log('Conductor juan insertado en RTDB (ubicación lejana)');

  // 2. Crear un pedido entregado con destino en Tuxtla
  const pedidoRef = await db.collection('pedidos').add({
    latTienda: 16.753,
    lngTienda: -93.115,
    latCliente: 16.753, // destino real
    lngCliente: -93.115,
    estado: 'PENDIENTE',
    conductorId: 'juan',
    cliente: 'prueba',
    timestamp: new Date()
  });
  const pedidoId = pedidoRef.id;
  console.log('Pedido de prueba creado en Firestore con ID:', pedidoId);

  // 3. Simular cambio de estado a 'ENTREGADO'
  await db.collection('pedidos').doc(pedidoId).update({
    estado: 'ENTREGADO'
  });
  console.log('Estado del pedido actualizado a ENTREGADO. Espera la auditoría del agente.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
