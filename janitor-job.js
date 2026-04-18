// janitor-job.js
// Limpieza automática de pedidos antiguos en RTDB
const admin = require('firebase-admin');
const cron = require('node-cron');

// Inicializa Firebase Admin si no está ya inicializado
if (!admin.apps.length) {
  const serviceAccount = require('./nelly-admin.json');
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://nelly-delivery-default-rtdb.firebaseio.com"
  });
}
const db = admin.database();

// Se ejecuta a las 3:00 AM todos los días
cron.schedule('0 3 * * *', async () => {
  console.log("🧹 Iniciando limpieza automática de pedidos antiguos...");
  const ref = db.ref('pedidos');
  const now = Date.now();
  const limiteMs = 12 * 60 * 60 * 1000; // 12 horas
  try {
    const snapshot = await ref.once('value');
    snapshot.forEach(child => {
      const pedido = child.val();
      const creado = pedido?.creado || pedido?.timestamp || 0;
      if (creado && (now - creado > limiteMs)) {
        console.log(`🗑️ Borrando pedido antiguo: ${child.key}`);
        child.ref.remove();
      }
    });
    console.log("✅ Limpieza completada.");
  } catch (e) {
    console.error("❌ Error en limpieza automática:", e);
  }
});
