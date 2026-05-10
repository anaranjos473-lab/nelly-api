// test-verifica-antifraude.js
// Verifica si el pedido y el conductor fueron marcados correctamente por el agente antifraude
import { getAdmin } from './config/firebase-admin-esm.js';

const pedidoId = 'DMjDDKKwP6IO5rXgYLfy'; // ID generado en la simulación
const conductorId = 'juan';

async function main() {
  const admin = await getAdmin();
  const db = admin.firestore();
  const rtdb = admin.database();

  // 1. Verificar el pedido
  const pedidoSnap = await db.collection('pedidos').doc(pedidoId).get();
  if (!pedidoSnap.exists) {
    console.log('❌ Pedido no encontrado');
    return;
  }
  const pedido = pedidoSnap.data();
  console.log('Pedido:', pedido);
  if (pedido.alertaFraude) {
    console.log('🚨 El pedido fue marcado con alertaFraude: true');
  } else {
    console.log('✅ El pedido NO fue marcado como fraude');
  }

  // 2. Verificar el estado del conductor
  const conductorSnap = await rtdb.ref(`conductores_activos/${conductorId}`).once('value');
  const datosConductor = conductorSnap.val();
  if (datosConductor && datosConductor.estado === 'EN_REVISION') {
    console.log('🚩 El conductor fue puesto en estado EN_REVISION');
  } else {
    console.log('✅ El conductor NO fue puesto en revisión');
  }
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
