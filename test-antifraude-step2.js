// test-antifraude-step2.js
// Paso 2: Actualiza el pedido a 'ENTREGADO' para activar el agente antifraude
import { getAdmin } from './config/firebase-admin-esm.js';

const pedidoId = '2jA3SiaTWwAeQcn7amTB'; // ID generado en el paso 1

async function main() {
  const admin = await getAdmin();
  const db = admin.firestore();

  await db.collection('pedidos').doc(pedidoId).update({
    estado: 'ENTREGADO'
  });
  console.log('Estado del pedido actualizado a ENTREGADO. Espera la auditoría del agente.');
}

main().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
