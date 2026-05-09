import { getAdmin } from '../../config/firebase-admin-esm.js';

// Reutilizamos la fórmula de Haversine para la auditoría
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

export const iniciarAgenteAntifraude = async () => {
    const admin = await getAdmin();
    const db = admin.firestore();
    const rtdb = admin.database();
    console.log("🛡️ [Agente Antifraude] Guardián de telemetría activado.");

    db.collection('pedidos').onSnapshot(async (snapshot) => {
        snapshot.docChanges().forEach(async (change) => {
            // Solo nos interesa cuando un pedido existente se modifica
            if (change.type === 'modified') {
                const pedidoNuevo = change.doc.data();
                const pedidoId = change.doc.id;

                // TRIGGER: El conductor marca el pedido como "ENTREGADO"
                if (pedidoNuevo.estado === 'ENTREGADO' && pedidoNuevo.conductorId) {
                    try {
                        console.log(`🔍 [Auditoría] Verificando entrega del pedido: ${pedidoId}`);

                        // 1. Extraer la última coordenada conocida del conductor en RTDB
                        const refConductor = rtdb.ref(`conductores_activos/${pedidoNuevo.conductorId}`);
                        const snapshotConductor = await refConductor.once('value');
                        const datosConductor = snapshotConductor.val();

                        if (!datosConductor || !datosConductor.lat || !datosConductor.lng) {
                            console.log(`⚠️ [Alerta Menor] GPS no encontrado para el conductor ${pedidoNuevo.conductorId} en el momento de la entrega.`);
                            return;
                        }

                        // 2. Calcular distancia entre el conductor y el destino del cliente
                        const latDestino = pedidoNuevo.latCliente || pedidoNuevo.latTienda;
                        const lngDestino = pedidoNuevo.lngCliente || pedidoNuevo.lngTienda;
                        if (!latDestino || !lngDestino) {
                            console.log(`⚠️ [Alerta Menor] Coordenadas de destino no encontradas en el pedido ${pedidoId}.`);
                            return;
                        }
                        const distanciaReal = calcularDistancia(
                            datosConductor.lat, datosConductor.lng,
                            latDestino, lngDestino
                        );

                        // 3. Regla de Negocio: Límite de 500 metros (0.5 km)
                        if (distanciaReal > 0.5) {
                            console.log(`🚨 [FRAUDE DETECTADO] Conductor ${pedidoNuevo.conductorId} marcó entregado a ${distanciaReal.toFixed(2)} km de distancia.`);

                            // 4. Castigo / Acción de Seguridad
                            await db.collection('pedidos').doc(pedidoId).update({
                                alertaFraude: true,
                                distanciaFalloKm: distanciaReal,
                                notasAuditoria: "Marcado como entregado fuera del radio permitido."
                            });

                            // Opcional: Pausar al conductor en RTDB para que el Agente de Despacho no le dé más viajes
                            await refConductor.update({ estado: 'EN_REVISION' });
                        } else {
                            console.log(`✅ [Entrega Legítima] Pedido ${pedidoId} entregado a ${distanciaReal.toFixed(2)} km del objetivo.`);
                        }

                    } catch (error) {
                        console.error("❌ [Error en Agente Antifraude]:", error);
                    }
                }
            }
        });
    });
};
