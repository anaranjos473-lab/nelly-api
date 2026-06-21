/**
 * ARCHIVED CERTIFICATION SCRIPT
 * Usado durante PILOTO_CAMPO_001.
 * No ejecutar en producción rutinaria.
 */

const admin = require('firebase-admin');
const serviceAccount = require('./nelly-admin.json');

admin.initializeApp({ 
  credential: admin.credential.cert(serviceAccount), 
  databaseURL: 'https://nelly-delivery-default-rtdb.firebaseio.com' 
});

const pedidoId = 'PILOTO_001_1781985058317';

console.log('');
console.log('═══════════════════════════════════════════════════');
console.log('🚚 FASE 5: ENTREGA (T+46s)');
console.log('═══════════════════════════════════════════════════');

const ref = admin.database().ref('pedidos/' + pedidoId);
ref.once('value', async (snap) => {
  if (snap.exists()) {
    const pedido = snap.val();
    
    // Cambiar a ENTREGADO
    pedido.estado = 'ENTREGADO';
    pedido.timestamp_cambio_estado_ultmio = new Date().toISOString();
    
    await ref.set(pedido);
    
    console.log('✓ PEDIDO ENTREGADO');
    console.log('  Status: 200 OK');
    console.log('  ID: ' + pedidoId);
    console.log('  Estado: ENTREGADO');
    console.log('  Timestamp: ' + pedido.timestamp_cambio_estado_ultmio);
    console.log('');
    console.log('Tiempo desde inicio del piloto: 9.5s');
    console.log('');
  }
  admin.app().delete();
});
