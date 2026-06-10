const path = require('path');
const fs = require('fs');
const admin = require('firebase-admin');

function loadServiceAccount() {
  const localPath = path.join(process.cwd(), 'nelly-admin.json');
  if (fs.existsSync(localPath)) {
    return require(localPath);
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

  const db = admin.database();
  const uid = 'fE8uV6dke3XziYNhuO3kZU93xQj1';
  const now = Date.now();
  const orderId = `test_para_reparto_asg_${now}`;

  const profile = {
    uid,
    email: 'driver_tuxtla_001@nelly.com',
    nombre: 'Driver Tuxtla 001',
    activo: true,
    estado: 'disponible'
  };

  const pedido = {
    id_pedido: orderId,
    cliente_nombre: 'Cliente Prueba Reparto',
    telefono: '+521234567890',
    direccion: 'Calle Test 123',
    colonia: 'Centro',
    tienda_nombre: 'Cocina Prueba',
    descripcion: 'Pedido asignado para driver de prueba',
    monto: 149.0,
    total: 149.0,
    estado: 'pendiente',
    estado_pedido: 'pendiente',
    idConductor: uid,
    conductorId: uid,
    fecha: now,
    timestamp: now,
    timestampActualizacion: now,
    latTienda: 16.7528,
    lngTienda: -93.1167,
    lat: 16.7538,
    lng: -93.1150,
    fuente_origen: 'script_prueba_repartidor'
  };

  await db.ref(`repartidores/${uid}`).set(profile);
  await db.ref(`repartidores_activos/${uid}`).set({
    uid,
    estado: 'DISPONIBLE',
    actualizado: now
  });
  await db.ref(`pedidos_para_reparto/${orderId}`).set(pedido);
  await db.ref(`pedidos_en_camino/${orderId}`).set(pedido);

  console.log('Perfil mínimo creado en RTDB y pedido de prueba asignado.');
  console.log(`Nodo perfil: repartidores/${uid}`);
  console.log(`Nodo activo: repartidores_activos/${uid}`);
  console.log(`Nodo pedido pedidos_para_reparto: pedidos_para_reparto/${orderId}`);
  console.log(`Nodo pedido pedidos_en_camino: pedidos_en_camino/${orderId}`);
}

main().catch((error) => {
  console.error('Error al crear perfil y pedido:', error);
  process.exit(1);
});
