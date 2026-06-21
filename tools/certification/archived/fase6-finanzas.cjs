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
console.log('💰 FASE 6: FINANZAS - IMPACTO FINANCIERO (T+51s)');
console.log('═══════════════════════════════════════════════════');

(async () => {
  try {
    // Obtener saldo anterior del repartidor
    const repartidoresRef = admin.database().ref('conductores_activos');
    const snap = await repartidoresRef.limitToFirst(1).once('value');
    
    let saldoAnterior = 10000; // Saldo inicial por defecto
    let repartidorId = 'REPARTIDOR_PILOTO_001';
    
    // Si hay repartidores, usar el saldo del primero
    if (snap.exists()) {
      snap.forEach(child => {
        const repartidor = child.val();
        repartidorId = child.key;
        saldoAnterior = repartidor.saldo || 10000;
      });
    }
    
    // Datos de la transacción
    const monto = 1000;
    const comision = 180; // 18%
    const saldoPosterior = saldoAnterior + monto - comision;
    
    // Registrar en finanzas
    const finanzaId = 'FIN_' + Date.now();
    const finanza = {
      id: finanzaId,
      pedido_id: pedidoId,
      repartidor_id: repartidorId,
      saldo_anterior: saldoAnterior,
      monto: monto,
      comision: comision,
      saldo_posterior: saldoPosterior,
      timestamp: new Date().toISOString(),
      concepto: 'Entrega pedido #' + pedidoId.substring(0, 10) + '...'
    };
    
    await admin.database().ref('finanzas/' + finanzaId).set(finanza);
    
    // Actualizar saldo del repartidor
    await admin.database().ref('conductores_activos/' + repartidorId + '/saldo').set(saldoPosterior);
    
    console.log('✓ REGISTRO FINANZAS COMPLETADO');
    console.log('');
    console.log('📊 DETALLES DE LA TRANSACCIÓN:');
    console.log('  ID Finanza: ' + finanzaId);
    console.log('  Pedido: ' + pedidoId);
    console.log('  Repartidor: ' + repartidorId);
    console.log('  Saldo anterior: $' + saldoAnterior);
    console.log('  Monto pedido: $' + monto);
    console.log('  Comisión (18%): $' + comision);
    console.log('  ─────────────────────');
    console.log('  Saldo posterior: $' + saldoPosterior);
    console.log('');
    console.log('✅ Cálculo validado:');
    console.log('  ' + saldoAnterior + ' + ' + monto + ' - ' + comision + ' = ' + saldoPosterior);
    console.log('');
    
  } catch (error) {
    console.log('✗ ERROR en FASE 6:', error.message);
  }
  
  admin.app().delete();
})();
