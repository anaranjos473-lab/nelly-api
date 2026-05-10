
import { getAdmin } from '../../config/firebase-admin-esm.js';



const INTERVALO_MONITOREO = 300000; // 5 minutos en milisegundos

// 1. Tarea Cíclica: Retención de Clientes (Cron Job)
const monitorearRetrasos = async () => {
    try {
        console.log("🤝 [Agente Soporte] Verificando tiempos de espera de clientes...");
        const hace15Minutos = Date.now() - (15 * 60 * 1000);
        const admin = await getAdmin();
        const db = admin.firestore();
        // Buscamos pedidos pendientes que lleven mucho tiempo esperando
        const snapshotRetrasos = await db.collection('pedidos')
            .where('estado', '==', 'PENDIENTE')
            .where('timestampCreacion', '<', hace15Minutos)
            .where('intervencionSoporte', '==', false)
            .get();

        if (!snapshotRetrasos.empty) {
            const batch = db.batch();
            snapshotRetrasos.forEach(doc => {
                const pedidoRef = db.collection('pedidos').doc(doc.id);
                batch.update(pedidoRef, {
                    intervencionSoporte: true,
                    mensajeCliente: "Sabemos que la espera es larga. Te hemos aplicado un descuento para tu próximo viaje.",
                    bonoCompensacion: 15.00
                });
                console.log(`🎁 [Retención] Compensación aplicada al pedido retrasado: ${doc.id}`);
            });
            await batch.commit();
        }
    } catch (error) {
        console.error("❌ [Error Monitoreo Retrasos]:", error);
    }
};

// 2. Escucha Activa: Rescate de Repartidores

const escucharPercancesEnRuta = async () => {
    console.log("🛟 [Agente Soporte] Radar de emergencias en ruta activado.");
    const admin = await getAdmin();
    const db = admin.firestore();
    const rtdb = admin.database();
    db.collection('pedidos').where('estado', '==', 'PERCANCE').onSnapshot(async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            if (change.type === 'added' || change.type === 'modified') {
                const pedidoId = change.doc.id;
                const pedidoFallido = change.doc.data();
                if (pedidoFallido.conductorId) {
                    console.log(`🚨 [Soporte] Rescatando pedido ${pedidoId} del conductor ${pedidoFallido.conductorId}`);
                    // A) Liberar el pedido para que el Agente de Despacho lo reasigne a otro
                    await db.collection('pedidos').doc(pedidoId).update({
                        estado: 'PENDIENTE',
                        conductorAnterior: pedidoFallido.conductorId,
                        conductorId: "",
                        timestampActualizacion: Date.now()
                    });
                    // B) Pausar al conductor accidentado o con problemas en RTDB
                    await rtdb.ref(`conductores_activos/${pedidoFallido.conductorId}`).update({
                        estado: 'PAUSADO_POR_SOPORTE'
                    });
                }
            }
        });
    });
};

export const iniciarAgenteSoporte = async () => {
    console.log("🤝🛟 Agente de Soporte y Retención inicializado.");
    // Iniciar radar en tiempo real
    await escucharPercancesEnRuta();
    // Programar la ronda de vigilancia de tiempos
    setInterval(monitorearRetrasos, INTERVALO_MONITOREO);
};
