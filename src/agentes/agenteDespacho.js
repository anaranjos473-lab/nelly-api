import { getAdmin } from '../../config/firebase-admin-esm.js';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    pedidosListener = pedidosRef.orderByChild('estado').equalTo('pendiente');

    const handlePendiente = async (snapshot) => {
        const pedido = snapshot.val();
        const pedidoId = snapshot.key;
        if (!pedido || pedido.estado !== 'pendiente') return;

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
            await rtdb.ref(`pedidos/${pedidoId}`).update({
                conductorId: mejor.id,
                estado: 'en_curso',
                timestampActualizacion: Date.now()
            });
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
