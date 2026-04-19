// smoke-test.js
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { resolveTestConfig } = require('./scripts/resolve-test-config');

const { apiKey, baseUrl } = resolveTestConfig();
const rawUrls = process.env.SMOKE_TEST_URLS || baseUrl;
const API_KEY = apiKey;

const BASE_URLS = rawUrls
    .split(',')
    .map((url) => url.trim())
    .filter(Boolean)
    .map((url) => url.replace(/\/+$/, ''));

async function inyectarPedido() {
    const timestamp = new Date().toISOString().replace(/:/g, '-');
    const logPath = path.join(process.cwd(), 'logs_pruebas');
    if (!fs.existsSync(logPath)) {
        fs.mkdirSync(logPath, { recursive: true });
    }

    const resultado = {
        fecha: new Date().toLocaleString(),
        urls_objetivo: BASE_URLS,
        exitoso: false,
        endpoint_exitoso: null,
        respuesta: null,
        intentos: [],
        error: null
    };

    if (!API_KEY) {
        console.error('❌ ORDER_INGEST_API_KEY no está configurada.');
        resultado.error = 'ORDER_INGEST_API_KEY no esta configurada';
        fs.writeFileSync(
            path.join(logPath, `test_${timestamp}.json`),
            JSON.stringify(resultado, null, 2)
        );
        process.exitCode = 1;
        return;
    }

    const payload = {
        id_pedido: `AUTO_${Date.now()}`,
        cliente_nombre: 'Validacion Final Entorno',
        monto: 250,
        descripcion: 'Tacos de Cochinita y Refresco',
        origen: 'Smoke Test Automatizado',
        estado: 'pendiente'
    };

    const errores = [];
    for (const baseUrl of BASE_URLS) {
        const endpoint = `${baseUrl}/api/pedidos`;
        try {
            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': API_KEY
                },
                body: JSON.stringify(payload)
            });

            let data = null;
            try {
                data = await response.json();
            } catch (_jsonErr) {
                data = { message: 'respuesta sin JSON' };
            }

            if (!response.ok) {
                const detalle = `${response.status} ${response.statusText}`;
                errores.push(`${endpoint} -> ${detalle}`);
                resultado.intentos.push({
                    endpoint,
                    status: response.status,
                    statusText: response.statusText,
                    ok: false,
                    body: data
                });
                console.warn(`⚠️ Endpoint no disponible: ${endpoint} (${detalle})`);
                continue;
            }

            console.log(`🚀 Resultado en ${baseUrl}:`, data);
            resultado.exitoso = true;
            resultado.endpoint_exitoso = endpoint;
            resultado.respuesta = data;
            resultado.intentos.push({
                endpoint,
                status: response.status,
                statusText: response.statusText,
                ok: true,
                body: data
            });
            fs.writeFileSync(
                path.join(logPath, `test_${timestamp}.json`),
                JSON.stringify(resultado, null, 2)
            );
            return;
        } catch (error) {
            errores.push(`${endpoint} -> ${error.message}`);
            resultado.intentos.push({
                endpoint,
                ok: false,
                error: error.message
            });
            console.warn(`⚠️ Error de red en ${endpoint}: ${error.message}`);
        }
    }

    console.error('❌ Error en la prueba de entorno: ningún endpoint respondió correctamente.');
    console.error(errores.join('\n'));
    resultado.error = errores.join('\n');
    fs.writeFileSync(
        path.join(logPath, `test_${timestamp}.json`),
        JSON.stringify(resultado, null, 2)
    );
    process.exitCode = 1;
}

inyectarPedido();
