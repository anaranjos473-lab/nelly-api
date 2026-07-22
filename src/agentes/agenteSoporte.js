import { getAdmin } from '../../config/firebase-admin-esm.js';
import { ORDER_STATES } from '../domain/index.js';
import { normalizeState } from '../domain/stateMachine.js';
import {
    buildSupportInterventionPayload,
    buildSupportRescuePayload
} from '../services/agentSyncService.js';

const INTERVALO_MONITOREO = 300000; // 5 minutos
const MENSAJE_COMPENSACION = 'Sabemos que la espera es larga. Te hemos aplicado un descuento para tu próximo viaje.';
let monitoreoInterval = null;
let pedidosPercanceRef = null;
let percanceHandlers = [];

const esEstadoPendiente = (estado) => normalizeState(estado) === ORDER_STATES.PENDIENTE;

const esEstadoPercance = (estado) => normalizeState(estado) === 'PERCANCE';

const estadoPendienteDestino = (estadoOriginal) => (
    normalizeState(estadoOriginal) === 'PERCANCE' ? ORDER_STATES.PENDIENTE : ORDER_STATES.PENDIENTE
);

export const identificarPedidosRetrasados = (pedidos, ahora = Date.now()) => {
    const hace15Minutos = ahora - (15 * 60 * 1000);
    const entries = Object.entries(pedidos || {});

    return entries.filter(([, pedido]) => {
        if (!pedido || typeof pedido !== 'object') {
            return false;
        }

        const timestampCreacion = Number(pedido.timestampCreacion);
        return (
            esEstadoPendiente(pedido.estado) &&
            pedido.intervencionSoporte !== true &&
            Number.isFinite(timestampCreacion) &&
            timestampCreacion < hace15Minutos
        );
    });
};

const monitorearRetrasos = async () => {
    try {
        console.log('🤝 [Agente Soporte] Verificando tiempos de espera de clientes...');
        const admin = await getAdmin();
        const rtdb = admin.database();
        const snapshotPedidos = await rtdb.ref('pedidos').once('value');
        const pedidosRetrasados = identificarPedidosRetrasados(snapshotPedidos.val());

        await Promise.all(pedidosRetrasados.map(async ([pedidoId]) => {
            await rtdb.ref().update(buildSupportInterventionPayload(pedidoId, MENSAJE_COMPENSACION, 15.00));
            console.log(`🎁 [Retención] Compensación aplicada al pedido retrasado: ${pedidoId}`);
        }));
    } catch (error) {
        console.error('❌ [Error Monitoreo Retrasos]:', error);
    }
};

const rescatarPedidoEnPercance = async (rtdb, pedidoId, pedidoFallido) => {
    if (!pedidoFallido || !pedidoFallido.conductorId || !esEstadoPercance(pedidoFallido.estado)) {
        return;
    }

    console.log(`🚨 [Soporte] Rescatando pedido ${pedidoId} del conductor ${pedidoFallido.conductorId}`);

    await rtdb.ref().update(
        buildSupportRescuePayload(
            pedidoId,
            pedidoFallido.conductorId,
            estadoPendienteDestino(pedidoFallido.estado)
        )
    );
};

const registrarListenerPercance = (query, eventName, handler) => {
    query.on(eventName, handler, (error) => {
        console.error(`[Agente Soporte] Error listener ${eventName}:`, error);
    });
    percanceHandlers.push({ query, eventName, handler });
};

const escucharPercancesEnRuta = async () => {
    console.log('🛟 [Agente Soporte] Radar de emergencias en ruta activado.');
    const admin = await getAdmin();
    const rtdb = admin.database();

    pedidosPercanceRef = rtdb.ref('pedidos');

    const consultas = [
        pedidosPercanceRef.orderByChild('estado').equalTo('PERCANCE')
    ];

    consultas.forEach((query) => {
        const handler = async (snapshot) => {
            await rescatarPedidoEnPercance(rtdb, snapshot.key, snapshot.val());
        };

        registrarListenerPercance(query, 'child_added', handler);
        registrarListenerPercance(query, 'child_changed', handler);
    });
};

export const iniciarAgenteSoporte = async () => {
    console.log('🤝🛟 Agente de Soporte y Retención inicializado.');

    await escucharPercancesEnRuta();
    await monitorearRetrasos();

    if (monitoreoInterval) {
        clearInterval(monitoreoInterval);
    }
    monitoreoInterval = setInterval(monitorearRetrasos, INTERVALO_MONITOREO);
};

export const limpiarAgenteSoporte = () => {
    if (monitoreoInterval) {
        clearInterval(monitoreoInterval);
        monitoreoInterval = null;
    }

    percanceHandlers.forEach(({ query, eventName, handler }) => {
        query.off(eventName, handler);
    });
    percanceHandlers = [];
    pedidosPercanceRef = null;
};
