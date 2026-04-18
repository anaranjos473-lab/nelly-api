// smoke-test.js
require('dotenv').config();
const axios = require('axios');

const URL_API = 'https://nelly-api-8lh1.onrender.com/api/pedidos';
const API_KEY = process.env.ORDER_INGEST_API_KEY || process.env.SMOKE_TEST_API_KEY || '';

async function enviarPrueba() {
    const payload = {
        id_pedido: `AUTO_${Date.now()}`,
        cliente_nombre: "Robot de Prueba",
        descripcion: "2x Tacos de Cochinita (Automatizado)",
        monto: 150,
        estado: "pendiente"
    };

    try {
        const headers = {};
        if (API_KEY) {
            headers['x-api-key'] = API_KEY;
        }

        const res = await axios.post(URL_API, payload, { headers });
        console.log(`✅ Pedido inyectado: ${payload.id_pedido}`);
        console.log(`📡 Respuesta del Servidor: ${res.status}`);
    } catch (err) {
        console.error('❌ Error en el flujo automático:', err.message);
    }
}

enviarPrueba();
