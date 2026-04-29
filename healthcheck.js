import fetch from 'node-fetch';

const BASE_URL = 'https://nelly-api.onrender.com';

async function checkEndpoint(path, expected) {
    try {
        const res = await fetch(`${BASE_URL}${path}`);
        const text = await res.text();
        if (text.includes(expected)) {
            console.log(`✅ ${path} responde correctamente.`);
        } else {
            console.error(`❌ ${path} no responde como se esperaba. Respuesta:`, text);
        }
    } catch (e) {
        console.error(`❌ Error al consultar ${path}:`, e.message);
    }
}

await checkEndpoint('/api/salud', '"success":true');
await checkEndpoint('/test-vivo', 'Nelly está viva');
