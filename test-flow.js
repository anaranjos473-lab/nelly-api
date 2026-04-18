// test-flow.js
// Ejecútalo con: node test-flow.js
require('dotenv').config();
const axios = require('axios');
const API_KEY = process.env.ORDER_INGEST_API_KEY || process.env.SMOKE_TEST_API_KEY || '';

const testOrder = {
    id_pedido: `AUTO_${Date.now()}`,
    cliente: "Prueba Automática",
    monto: 150,
    items: "2x Hamburguesas Especiales",
    ubicacion: "Centro, Tuxtla Gtz"
};

async function checkSystem() {
    try {
        console.log("🚀 Iniciando Smoke Test...");
        // 1. Inyectar pedido
        const headers = {};
        if (API_KEY) {
            headers['x-api-key'] = API_KEY;
        }

        await axios.post('https://nelly-api-8lh1.onrender.com/api/pedidos', testOrder, { headers });
        console.log("✅ Pedido inyectado. Revisa tu Panel de Cocina.");
        // 2. Verificar salud
        const health = await axios.get('https://nelly-api-8lh1.onrender.com/healthcheck');
        console.log(`📡 Estado del Servidor: ${health.data.status}`);
    } catch (e) {
        console.error("❌ Fallo en el sistema: ", e.message);
    }
}
checkSystem();
