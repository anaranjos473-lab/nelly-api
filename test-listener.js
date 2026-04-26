// test-listener.js
// Prueba automatizada: Listener de asignación de pedidos y alerta Discord

const admin = require('firebase-admin');
const serviceAccount = require('./nelly-admin.json');

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL
  });
}

async function testAsignacion() {
  const db = admin.database();
  // 1. Crear pedido de prueba
  const pedidoRef = db.ref('pedidos_activos').push();
  const pedidoId = pedidoRef.key;
  await pedidoRef.set({
    cliente_nombre: 'Test Listener',
    monto: 99,
    logistica: { estado: 'pendiente', repartidor_id: null }
  });
  console.log(`[TEST] Pedido de prueba creado: ${pedidoId}`);

  // 2. Simular asignación de repartidor tras 2 segundos
  setTimeout(async () => {
    await pedidoRef.child('logistica').update({ repartidor_id: 'driver_test_123' });
    console.log(`[TEST] Asignado repartidor driver_test_123 a pedido ${pedidoId}`);
    process.exit(0);
  }, 2000);
}

testAsignacion();
