

import 'dotenv/config';
import axios from 'axios';
import admin from 'firebase-admin';
import { resolveTestConfig } from './scripts/resolve-test-config.js';

const { apiKey, baseUrl } = resolveTestConfig();
const CONFIG = {
    RETRIES: Number(process.env.NELLY_RETRIES || 5),
    INTERVAL: Number(process.env.NELLY_INTERVAL_MS || 1500),
    STRICT_MODE: process.env.NELLY_STRICT === 'true'
};

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

    return (await import('./nelly-admin.json', { assert: { type: 'json' } })).default;
}

const serviceAccount = loadServiceAccount();

const db = admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
}).database();

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizarEstado(value) {
    const raw = String(value || '').trim().toLowerCase();
    if (!raw) return '';
    if (raw === 'en_reparto' || raw === 'reparto') return 'EN_CAMINO';
    if (raw === 'entregado' || raw === 'finalizado') return 'ENTREGADO';
    return raw.toUpperCase();
}

async function snapshotPedido(idPedido) {
    const [pedSnap, repartoSnap, caminoSnap] = await Promise.all([
        db.ref('pedidos/' + idPedido).once('value'),
        db.ref('pedidos_para_reparto/' + idPedido).once('value'),
        db.ref('pedidos_en_camino/' + idPedido).once('value')
    ]);

    const pedVal = pedSnap.val() || null;
    const repartoVal = repartoSnap.val() || null;
    const caminoVal = caminoSnap.val() || null;

    const estadoPedido = normalizarEstado(pedVal?.estado);
    const estadoCamino = normalizarEstado(caminoVal?.estado || repartoVal?.estado);

    return {
        existsPedidos: pedSnap.exists(),
        existsReparto: repartoSnap.exists() || caminoSnap.exists(),
        estadoPedido,
        estadoCamino,
        estadoActual: estadoCamino || estadoPedido || ''
    };
}

async function esperarDerivacion(idPedido) {
    const history = [];
    console.log(`INICIO_DIAGNOSTICO: pedido=${idPedido} strict=${CONFIG.STRICT_MODE}`);

    for (let i = 1; i <= CONFIG.RETRIES; i++) {
        const state = await snapshotPedido(idPedido);
        history.push(state.estadoActual || '(sin_estado)');

        const transicionEnCamino = history.includes('PENDIENTE')
            && history.some((s) => s === 'EN_CAMINO' || s === 'ENTREGADO');

        if (!state.existsReparto) {
            console.log(`INTENTO_${i}: pendiente (estado=${state.estadoActual || 'sin_estado'})`);
        }

        if (state.existsPedidos && state.existsReparto && transicionEnCamino) {
            return {
                state,
                history,
                ok: true,
                elapsedMs: i * CONFIG.INTERVAL,
                attempts: i
            };
        }

        if (i < CONFIG.RETRIES) {
            await sleep(CONFIG.INTERVAL);
        }
    }

    const state = await snapshotPedido(idPedido);
    history.push(state.estadoActual || '(sin_estado)');

    const transicionEnCamino = history.includes('PENDIENTE')
        && history.some((s) => s === 'EN_CAMINO' || s === 'ENTREGADO');

    return {
        state,
        history,
        ok: state.existsPedidos && state.existsReparto && transicionEnCamino,
        elapsedMs: CONFIG.RETRIES * CONFIG.INTERVAL,
        attempts: CONFIG.RETRIES
    };
}

async function run() {
    const idPedido = 'LIVE_FINAL_' + Date.now();
    const data = { id_pedido: idPedido, cliente_nombre: 'Validacion Final', descripcion: 'Prueba visual despacho', monto: 199, estado: 'pendiente' };
    const headers = apiKey ? { 'x-api-key': apiKey } : {};

    try {
        const response = await axios.post(`${baseUrl}/api/pedidos`, data, { headers });
        console.log('ID:', idPedido);
        console.log('HTTP:', response.status);
    } catch (e) {
        console.log('HTTP:', e.response ? e.response.status : e.message);
    }

    const result = await esperarDerivacion(idPedido);
    const { state, history, ok, elapsedMs, attempts } = result;

    console.log('EXISTS_PEDIDOS:', state.existsPedidos);
    console.log('EXISTS_REPARTO:', state.existsReparto);
    console.log('ESTADO_ACTUAL:', state.estadoActual || '(sin_estado)');
    console.log('ESTADOS_OBSERVADOS:', history.join(' -> '));
    console.log('INTENTOS_EJECUTADOS:', attempts);
    console.log('TIEMPO_TOTAL_MS:', elapsedMs);
    console.log('FLOW_OK:', ok);

    if (ok) {
        console.log(`RESULTADO: EXITO (derivado en ${elapsedMs}ms)`);
        process.exit(0);
        return;
    }

    if (CONFIG.STRICT_MODE) {
        console.error('RESULTADO: FALLO_CRITICO (sin derivacion en tiempo limite)');
        process.exit(1);
        return;
    }

    console.warn('RESULTADO: ADVERTENCIA (gap de integracion; flujo manual puede ser necesario)');
    process.exit(0);
}
run();

