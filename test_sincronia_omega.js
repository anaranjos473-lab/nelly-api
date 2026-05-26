// Script de prueba automatizada – Sincronía Omega (Node.js)
// Simula asignación, cambio de estado y validación de túneles y estados

const admin = require('firebase-admin');
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  databaseURL: 'https://<TU_DB>.firebaseio.com'
});
const db = admin.database();

async function testAsignacionYEstados() {
  // 1. Simular asignación de pedido
  const pedidoId = 'test_' + Date.now();
  const repartidorId = 'repartidor_test';
  await db.ref('pedidos/' + pedidoId).set({
    estado: 'pendiente',
    repartidorId,
    monto: 100,
    timestamp: Date.now()
  });
  console.log('Pedido asignado');

  // 2. Simular cambio a EN_REPARTO
  await db.ref('pedidos/' + pedidoId).update({ estado: 'en_reparto' });
  console.log('Estado cambiado a EN_REPARTO');

  // 3. Simular entrega
  await db.ref('pedidos/' + pedidoId).update({ estado: 'entregado' });
  console.log('Estado cambiado a ENTREGADO');

  // 4. Validar sincronía
  const pedido = (await db.ref('pedidos/' + pedidoId).once('value')).val();
  if (pedido.estado === 'entregado') {
    console.log('✔️ Flujo de estados correcto');
  } else {
    console.error('❌ Error en flujo de estados');
  }

  // 5. Limpiar
  await db.ref('pedidos/' + pedidoId).remove();
  console.log('Prueba finalizada y limpiada');
}

testAsignacionYEstados().catch(console.error);
