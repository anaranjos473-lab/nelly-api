const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

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

exports.antifraudePedidoEntregado = functions.firestore
    .document('pedidos/{pedidoId}')
    .onUpdate(async (change, context) => {
        const before = change.before.data();
        const after = change.after.data();
        const pedidoId = context.params.pedidoId;

        // Solo auditar si el estado cambió a ENTREGADO
        if (before.estado !== 'ENTREGADO' && after.estado === 'ENTREGADO' && after.conductorId) {
            console.log(`[Antifraude] Pedido ${pedidoId} marcado como ENTREGADO. Iniciando auditoría...`);
            try {
                // Obtener última ubicación del conductor en RTDB
                const refConductor = admin.database().ref(`conductores_activos/${after.conductorId}`);
                const snapshotConductor = await refConductor.once('value');
                const datosConductor = snapshotConductor.val();

                if (!datosConductor || !datosConductor.lat || !datosConductor.lng) {
                    console.log(`[Antifraude] GPS no encontrado para el conductor ${after.conductorId}.`);
                    return null;
                }

                // Usar latCliente/lngCliente si existen, si no latTienda/lngTienda
                const latDestino = after.latCliente || after.latTienda;
                const lngDestino = after.lngCliente || after.lngTienda;
                if (!latDestino || !lngDestino) {
                    console.log(`[Antifraude] Coordenadas de destino no encontradas en el pedido ${pedidoId}.`);
                    return null;
                }

                const distancia = calcularDistancia(
                    datosConductor.lat, datosConductor.lng,
                    latDestino, lngDestino
                );

                if (distancia > 0.5) {
                    console.log(`[FRAUDE DETECTADO] Pedido ${pedidoId} entregado a ${distancia.toFixed(2)} km del destino.`);
                    // Marcar pedido y conductor
                    await change.after.ref.update({
                        alertaFraude: true,
                        distanciaFalloKm: distancia,
                        notasAuditoria: "Marcado como entregado fuera del radio permitido."
                    });
                    await refConductor.update({ estado: 'EN_REVISION' });
                } else {
                    console.log(`[Antifraude] Entrega legítima (${distancia.toFixed(2)} km).`);
                }
            } catch (error) {
                console.error(`[Antifraude] Error en auditoría:`, error);
            }
        }
        return null;
    });