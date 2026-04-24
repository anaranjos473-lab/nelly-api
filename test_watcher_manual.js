const admin = require('firebase-admin');
require('dotenv').config();

function loadServiceAccount() {
    const raw = process.env.FIREBASE_ADMIN_JSON;
    if (raw) {
        try {
            if (raw.trim().startsWith('{')) {
                return JSON.parse(raw);
            }
            return JSON.parse(Buffer.from(raw, 'base64').toString('utf8'));
        } catch (error) {
            console.error('FIREBASE_ADMIN_JSON invalido:', error.message);
        }
    }
    return require('./nelly-admin.json');
}

const serviceAccount = loadServiceAccount();
const app = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
});
const db = app.database();

async function runTest() {
    const idPedido = 'TEST_WATCHER_' + Date.now();
    const ref = db.ref('pedidos/' + idPedido);
    
    // Crear pedido con timestamp antiguo (6 minutos atrás para que el watcher lo tome)
    const seisMinutosAtras = Date.now() - (6 * 60 * 1000);
    
    console.log('--- Creando pedido de prueba ---');
    await ref.set({
        id: idPedido,
        cliente_nombre: 'Test Watcher',
        estado: 'pendiente',
        timestamp: seisMinutosAtras,
        monto: 100
    });
    console.log('Pedido creado:', idPedido, 'con estado: pendiente y timestamp antiguo.');

    console.log('--- Esperando que el watcher actúe (65 segundos) ---');
    // El watcher corre cada 60 segundos. Esperamos 65 para estar seguros.
    await new Promise(resolve => setTimeout(resolve, 65000));

    const snapshot = await ref.once('value');
    const pedido = snapshot.val();
    
    console.log('Estado final del pedido:', pedido.estado);
    
    if (pedido.estado === 'en_reparto') {
        console.log('✅ TEST EXITOSO: El pedido fue promovido a en_reparto.');
        process.exit(0);
    } else {
        console.log('❌ TEST FALLIDO: El pedido sigue en estado:', pedido.estado);
        process.exit(1);
    }
}

runTest().catch(err => {
    console.error('Error en el test:', err);
    process.exit(1);
});
