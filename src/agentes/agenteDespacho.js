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

async function initFirebaseRefs() {
    const admin = await getAdmin();
    return admin.database();
}

export const iniciarAgenteDespacho = async () => {
    const rtdb = await initFirebaseRefs();
    console.log('🕵️ Agente de Despacho Nelly activo...');

    if (pedidosListener) {
        pedidosListener.off('child_added');
        pedidosListener.off('child_changed');
        pedidosListener = null;
    }

    const pedidosRef = rtdb.ref('pedidos');
    pedidosListener = pedidosRef.orderByChild('estado').equalTo(PENDIENTE_STATE);

    const handlePendiente = async (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        if (!pedido || normalizeState(pedido.estado) !== PENDIENTE_STATE) return;

        const conductoresSnap = await rtdb.ref('conductores_activos').once('value');
        const conductores = conductoresSnap.val();
        if (!conductores) return;

        const worker = new Worker(path.join(__dirname, 'workerDistancias.js'), {
            workerData: {
                origen: { lat: pedido.latTienda, lng: pedido.lngTienda },
                conductores
            }
        });

        worker.on('message', async (mejor) => {
            if (!mejor || !pedidoId) return;
            await rtdb.ref().update(buildDispatchAssignmentPayload(pedidoId, mejor.id));
            console.log(`✅ Pedido ${pedidoId} asignado a ${mejor.id}`);
        });

        worker.on('error', (error) => {
            console.error(`❌ Error worker despacho pedido ${pedidoId}:`, error);
        });
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
};
