
require('dotenv').config();
const axios = require('axios');
const admin = require('firebase-admin');

const serviceAccount = require('./nelly-admin.json');

const db = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
}).database();

async function run() {
    const idPedido = 'LIVE_FINAL_' + Date.now();
    const data = { id_pedido: idPedido, cliente_nombre: 'Validacion Final', descripcion: 'Prueba visual despacho', monto: 199, estado: 'pendiente' };
    const headers = process.env.ORDER_INGEST_API_KEY ? { 'x-api-key': process.env.ORDER_INGEST_API_KEY } : {};

    try {
        const response = await axios.post('https://nelly-api-8lh1.onrender.com/api/pedidos', data, { headers });
        console.log('ID:', idPedido);
        console.log('HTTP:', response.status);
    } catch (e) {
        console.log('HTTP:', e.response ? e.response.status : e.message);
    }

    await new Promise(r => setTimeout(r, 7000));
    const ped = await db.ref('pedidos/' + idPedido).once('value');
    const rep = await db.ref('pedidos_para_reparto/' + idPedido).once('value');
    console.log('EXISTS_PEDIDOS:', ped.exists());
    console.log('EXISTS_REPARTO:', rep.exists());
    process.exit(0);
}
run();

