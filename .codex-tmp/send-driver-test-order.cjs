const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  const secretPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(secretPath)) {
    return require(secretPath);
  }
  if (process.env.FIREBASE_ADMIN_JSON) {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    return raw.trim().startsWith('{')
      ? JSON.parse(raw)
      : JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
  }
  throw new Error('No se encontro credencial Firebase Admin');
}

async function main() {
  const serviceAccount = loadServiceAccount();
  const databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';

  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      databaseURL,
    });
  }

  const orderId = `test_driver_${Date.now()}`;
  const now = Date.now();
  const payload = {
    id: orderId,
    id_pedido: orderId,
    cliente_nombre: 'Cliente Prueba Reparto',
    telefono: '+521234567890',
    direccion: 'Calle Test 123',
    colonia: 'Centro',
    monto: 129.0,
    total: 129.0,
    descripcion: 'Pedido de prueba para repartidor',
    estado: 'LISTO',
    estado_pedido: 'LISTO',
    repartidor_id: null,
    conductorId: null,
    rejeccion: null,
    fuente_origen: 'script_prueba_repartidor',
    timestamp: now,
    actualizado_en: now,
    hora_cocina: new Date(now).toISOString()
  };

  await admin.database().ref(`pedidos_en_camino/${orderId}`).set(payload);
  console.log('Pedido de prueba creado en RTDB.');
  console.log(`Nodo: pedidos_en_camino/${orderId}`);
  console.log(JSON.stringify(payload, null, 2));
}

main().catch((error) => {
  console.error('Error creando pedido de prueba:', error);
  process.exit(1);
});
