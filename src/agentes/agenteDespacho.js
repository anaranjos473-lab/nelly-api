import { getAdmin } from '../../config/firebase-admin-esm.js';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';
import { ORDER_STATES } from '../domain/index.js';
import { normalizeState } from '../domain/stateMachine.js';
import { buildDispatchAssignmentPayload } from '../services/agentSyncService.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PENDIENTE_STATE = ORDER_STATES.PENDIENTE || 'PENDIENTE';

let pedidosListener = null;
let driversListener = null;
let driversCache = {
    driversSnapshot: [],
    driversRevision: 0,
    unsubscribeListener: null
};
let pedidosEnProceso = new Set();

async function initFirebaseRefs() {
    const admin = await getAdmin();
    return admin.database();
}

function buildDriversSnapshot(conductoresRaw) {
    return Object.entries(conductoresRaw || {})
        .map(([id, datos]) => ({
            id,
            estado: datos?.estado ?? null,
            lat: Number(datos?.lat),
            lng: Number(datos?.lng)
        }))
        .filter((driver) => Boolean(driver.id));
}

function updateDriversCache(conductoresRaw) {
    driversCache = {
        driversSnapshot: buildDriversSnapshot(conductoresRaw),
        driversRevision: driversCache.driversRevision + 1,
        unsubscribeListener: driversCache.unsubscribeListener
    };
}

async function iniciarListenerConductores(rtdb) {
    if (driversCache.unsubscribeListener) {
        driversCache.unsubscribeListener();
        driversCache.unsubscribeListener = null;
    }

    driversListener = rtdb.ref('conductores_activos');
    let inicializado = false;
    const onValue = (snapshot) => {
        if (!inicializado) {
            inicializado = true;
            return;
        }
        updateDriversCache(snapshot.val());
    };
    const onError = (error) => {
        console.error('❌ Error listener conductores_activos:', error);
    };

    const initialSnapshot = await driversListener.once('value');
    updateDriversCache(initialSnapshot.val());

    driversListener.on('value', onValue, onError);
    driversCache.unsubscribeListener = () => {
        driversListener.off('value', onValue);
        driversListener = null;
    };
}

function finalizarPedidoEnProceso(pedidoId) {
    pedidosEnProceso.delete(pedidoId);
}

export const iniciarAgenteDespacho = async () => {
    const rtdb = await initFirebaseRefs();
    console.log('🕵️ Agente de Despacho Nelly activo...');

    if (pedidosListener) {
        pedidosListener.off('child_added');
        pedidosListener.off('child_changed');
        pedidosListener = null;
    }

    await iniciarListenerConductores(rtdb);

    const pedidosRef = rtdb.ref('pedidos');
    pedidosListener = pedidosRef.orderByChild('estado').equalTo(PENDIENTE_STATE);

    const handlePendiente = async (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        if (!pedido || normalizeState(pedido.estado) !== PENDIENTE_STATE) return;
        if (!pedidoId || pedidosEnProceso.has(pedidoId)) return;

        const revisionInicio = driversCache.driversRevision;
        const driversSnapshot = driversCache.driversSnapshot;
        if (!driversSnapshot.length) return;

        pedidosEnProceso.add(pedidoId);

        const lanzarWorker = (snapshotDrivers, revisionEsperada, intentos = 0) => {
            const worker = new Worker(path.join(__dirname, 'workerDistancias.js'), {
                workerData: {
                    pedido: {
                        id: pedidoId,
                        latTienda: pedido.latTienda,
                        lngTienda: pedido.lngTienda
                    },
                    origen: { lat: pedido.latTienda, lng: pedido.lngTienda },
                    driversSnapshot: snapshotDrivers,
                    revision: revisionEsperada
                }
            });

            worker.on('message', async (mejor) => {
                let liberarPedido = true;
                try {
                    if (!mejor || !pedidoId) return;
                    if (revisionEsperada !== driversCache.driversRevision) {
                        if (intentos >= 1) {
                            console.log(`ℹ️ [Despacho] Snapshot obsoleto para ${pedidoId}, se omite reasignación.`);
                            return;
                        }

                        liberarPedido = false;
                        if (worker && typeof worker.terminate === 'function') {
                            await worker.terminate();
                        }
                        await lanzarWorker(driversCache.driversSnapshot, driversCache.driversRevision, intentos + 1);
                        return;
                    }

                    await rtdb.ref().update(buildDispatchAssignmentPayload(pedidoId, mejor.id));
                    console.log(`✅ Pedido ${pedidoId} asignado a ${mejor.id}`);
                } finally {
                    if (liberarPedido) {
                        finalizarPedidoEnProceso(pedidoId);
                    }
                }
            });

            worker.on('error', (error) => {
                finalizarPedidoEnProceso(pedidoId);
                console.error(`❌ Error worker despacho pedido ${pedidoId}:`, error);
            });
        };

        lanzarWorker(driversSnapshot, revisionInicio);
    };

    pedidosListener.on('child_added', handlePendiente);
    pedidosListener.on('child_changed', handlePendiente);
};

export const limpiarAgenteDespacho = () => {
    if (pedidosListener) {
        pedidosListener.off('child_added');
        pedidosListener.off('child_changed');
        pedidosListener = null;
        console.log('🧹 Listener de pedidos (agente despacho) limpiado.');
    }

    if (driversCache.unsubscribeListener) {
        driversCache.unsubscribeListener();
        driversCache.unsubscribeListener = null;
    }
    driversCache = {
        driversSnapshot: [],
        driversRevision: 0,
        unsubscribeListener: null
    };
    driversListener = null;
    pedidosEnProceso.clear();
};
