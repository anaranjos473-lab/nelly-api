// Complete-order con fallback COMPLETO (incluyendo finanzas)
import 'dotenv/config';
import admin from 'firebase-admin';
import fs from 'fs';

// Cargar credenciales
const firebaseAdminPath = process.env.FIREBASE_ADMIN_JSON || './nelly-admin.json';
const serviceAccount = JSON.parse(fs.readFileSync(firebaseAdminPath, 'utf-8'));

const app = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
});

const db = app.database();

// Constantes
const COMISION_PORCENTAJE = 0.18;
const PEDIDO_ID = 'FINAL_CICLO_1782060235668';
const DRIVER_UID = 'bmKUeqDqHgbaaBmc8MUQXuyssLv2';

async function registrarCobroEfectivo(uid, montoEfectivo, pedidoId) {
  try {
    console.log(`💰 Registrando comisión: $${montoEfectivo.toFixed(2)} para driver ${uid}`);
    
    const ahora = Date.now();
    const cobroRef = db.ref(`finanzas/cobros_efectivos/${ahora}_${pedidoId}`);
    await cobroRef.set({
      uid,
      monto: montoEfectivo,
      pedido_id: pedidoId,
      fecha: ahora,
      estado: 'ACREDITADO'
    });

    // Actualizar saldo del repartidor
    const saldoRef = db.ref(`repartidores/${uid}/saldo_efectivo`);
    const snap = await saldoRef.once('value');
    const saldoActual = snap.val() || 0;
    const nuevoSaldo = saldoActual + montoEfectivo;
    
    await saldoRef.set(nuevoSaldo);
    console.log(`✅ Saldo actualizado: $${saldoActual.toFixed(2)} → $${nuevoSaldo.toFixed(2)}`);
    
    return { ok: true, nuevoSaldo, cobroRegistrado: montoEfectivo };
  } catch (error) {
    console.error(`❌ Error registrando comisión:`, error);
    throw error;
  }
}

async function completarPedido() {
  try {
    console.log(`\n🔄 Completando pedido: ${PEDIDO_ID}`);
    console.log(`👤 Driver: ${DRIVER_UID}`);

    // Obtener pedido
    const snap = await db.ref(`pedidos_en_camino/${PEDIDO_ID}`).once('value');
    const pedido = snap.val();

    if (!pedido) {
      console.error(`❌ Pedido no encontrado en pedidos_en_camino`);
      process.exit(1);
    }

    console.log(`📦 Pedido encontrado:`, pedido);

    // Calcular comisión
    const monto = pedido.monto || 0;
    const comision = Math.round(monto * COMISION_PORCENTAJE * 100) / 100;

    console.log(`\n💵 Cálculo de comisión:`);
    console.log(`   Monto: $${monto.toFixed(2)}`);
    console.log(`   Comisión (18%): $${comision.toFixed(2)}`);

    // 1. Registrar comisión en finanzas
    await registrarCobroEfectivo(DRIVER_UID, comision, PEDIDO_ID);

    // 2. Actualizar estados en RTDB
    const ahora = Date.now();
    console.log(`\n📝 Actualizando estados...`);
    
    await Promise.all([
      db.ref(`pedidos_en_camino/${PEDIDO_ID}`).update({
        estado: 'ENTREGADO',
        estado_pedido: 'ENTREGADO',
        entregado_en: ahora
      }),
      db.ref(`pedidos/${PEDIDO_ID}`).update({
        estado: 'ENTREGADO',
        estado_pedido: 'ENTREGADO',
        entregado_en: ahora
      }),
      db.ref(`pedidos_para_reparto/${PEDIDO_ID}`).remove(),
      db.ref(`repartidores/${DRIVER_UID}/pedido_activo`).remove()
    ]);

    console.log(`✅ Pedido completado correctamente`);
    console.log(`\n📊 RESULTADO FINAL:`);
    console.log(`   ✓ Estado: ENTREGADO`);
    console.log(`   ✓ Comisión: $${comision.toFixed(2)}`);
    console.log(`   ✓ Finanzas: REGISTRADO`);

    process.exit(0);
  } catch (error) {
    console.error(`\n❌ Error al completar pedido:`, error.message);
    process.exit(1);
  }
}

completarPedido();
