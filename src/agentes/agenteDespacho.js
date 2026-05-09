
import { getAdmin } from '../../config/firebase-admin-esm.js';
import { Worker } from 'worker_threads';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));


let db, rtdb;
let unsubscribePedidos = null;
async function initFirebaseRefs() {
    const admin = await getAdmin();
    db = admin.firestore();
    rtdb = admin.database();
}



export const iniciarAgenteDespacho = async () => {
	await initFirebaseRefs();
	console.log("🕵️ Agente de Despacho Nelly activo...");

	// Si ya hay un listener activo, lo limpiamos antes de crear uno nuevo
	if (typeof unsubscribePedidos === 'function') {
		unsubscribePedidos();
		unsubscribePedidos = null;
	}

	unsubscribePedidos = db.collection('pedidos').where('estado', '==', 'PENDIENTE').onSnapshot(async (snap) => {
		snap.docChanges().forEach(async (change) => {
			if (change.type === 'added') {
				const pedido = change.doc.data();
				const pedidoId = change.doc.id;

				const conductoresSnap = await rtdb.ref('conductores_activos').once('value');
				const conductores = conductoresSnap.val();

				if (!conductores) return;

				const worker = new Worker(path.join(__dirname, 'workerDistancias.js'), {
					workerData: { origen: { lat: pedido.latTienda, lng: pedido.lngTienda }, conductores }
				});

				worker.on('message', async (mejor) => {
					if (mejor) {
						await db.collection('pedidos').doc(pedidoId).update({
							conductorId: mejor.id,
							estado: 'EN_CURSO'
						});
						console.log(`✅ Pedido ${pedidoId} asignado a ${mejor.id}`);
					}
				});
			}
		});
	});
};

export const limpiarAgenteDespacho = () => {
	if (typeof unsubscribePedidos === 'function') {
		unsubscribePedidos();
		unsubscribePedidos = null;
		console.log('🧹 Listener de pedidos (agente despacho) limpiado.');
	}
};
