import { getAdmin } from './config/firebase-admin.js';

async function testRTDB() {
  const admin = await getAdmin();
  const db = admin.database();
  
  console.log('--- START RTDB AUDIT ---');
  const nodes = ['pedidos', 'pedidos_para_reparto', 'pedidos_en_camino', 'conductores_activos', 'repartidores_activos'];
  
  const report = [];

  for (const node of nodes) {
    let readOk = false;
    let exists = false;
    try {
      const snap = await db.ref(node).limitToFirst(1).once('value');
      readOk = true;
      exists = snap.exists();
    } catch(e) {
      console.log(`Error reading ${node}:`, e.message);
    }
    report.push({ NODO: node, "LECTURA OK": readOk, "EXISTS": exists });
  }

  console.table(report);
  process.exit(0);
}
testRTDB();