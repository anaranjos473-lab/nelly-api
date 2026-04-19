// test-flow.js
// Ejecútalo con: node test-flow.js
require('dotenv').config();
const axios = require('axios');
const { resolveTestConfig } = require('./scripts/resolve-test-config');

const { apiKey, baseUrl } = resolveTestConfig();

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
        if (apiKey) {
            headers['x-api-key'] = apiKey;
        }

        await axios.post(`${baseUrl}/api/pedidos`, testOrder, { headers });
        console.log("✅ Pedido inyectado. Revisa tu Panel de Cocina.");
        // 2. Verificar salud
        const health = await axios.get(`${baseUrl}/healthcheck`);
        console.log(`📡 Estado del Servidor: ${health.data.status}`);
    } catch (e) {
        console.error("❌ Fallo en el sistema: ", e.message);
    }
}
checkSystem();
