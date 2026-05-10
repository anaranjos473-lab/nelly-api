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

// Lógica de auditoría extraída para pruebas unitarias
export const auditarEntrega = async ({ pedido, datosConductor, pedidoId, db, rtdb }) => {
    if (!datosConductor || !datosConductor.lat || !datosConductor.lng) {
        console.log(`⚠️ [Alerta Menor] GPS no encontrado para el conductor ${pedido.conductorId} en el momento de la entrega.`);
        return { alerta: 'gps_faltante' };
    }
    const latDestino = pedido.latCliente || pedido.latTienda;
    const lngDestino = pedido.lngCliente || pedido.lngTienda;
    console.log('Destino:', { latDestino, lngDestino });
    if (!latDestino || !lngDestino) {
        console.log(`⚠️ [Alerta Menor] Coordenadas de destino no encontradas en el pedido ${pedidoId}.`);
        return { alerta: 'destino_faltante' };
    }
    const distanciaReal = calcularDistancia(
        datosConductor.lat, datosConductor.lng,
        latDestino, lngDestino
    );
    console.log('Distancia calculada (km):', distanciaReal);
    if (distanciaReal > 0.5) {
        console.log(`🚨 [FRAUDE DETECTADO] Conductor ${pedido.conductorId} marcó entregado a ${distanciaReal.toFixed(2)} km de distancia.`);
        if (db && rtdb) {
            const refConductor = rtdb.ref(`conductores_activos/${pedido.conductorId}`);
            await db.collection('pedidos').doc(pedidoId).update({
                alertaFraude: true,
                distanciaFalloKm: distanciaReal,
                notasAuditoria: "Marcado como entregado fuera del radio permitido."
            });
            await refConductor.update({ estado: 'EN_REVISION' });
        }
        return { alerta: 'fraude', distancia: distanciaReal };
    } else {
        console.log(`✅ [Entrega Legítima] Pedido ${pedidoId} entregado a ${distanciaReal.toFixed(2)} km del objetivo.`);
        return { alerta: 'ok', distancia: distanciaReal };
    }
};

export const iniciarAgenteAntifraude = async () => {
    const admin = await getAdmin();
    const db = admin.firestore();
    const rtdb = admin.database();
    console.log("🛡️ [Agente Antifraude] Guardián de telemetría activado.");

    db.collection('pedidos').onSnapshot(async (snapshot) => {
        console.log('[Antifraude] onSnapshot recibido. Total docs:', snapshot.size);
        snapshot.docChanges().forEach(async (change) => {
            // Solo nos interesa cuando un pedido existente se modifica
            if (change.type === 'modified') {
                const pedidoNuevo = change.doc.data();
                const pedidoId = change.doc.id;
                // Firestore no da el estado anterior directamente, pero podemos loguear todo el objeto
                console.log('--- [Antifraude] Cambio detectado ---');
                console.log('Pedido ID:', pedidoId);
                console.log('Nuevo estado:', pedidoNuevo.estado);
                // TRIGGER: El conductor marca el pedido como "ENTREGADO"
                if (pedidoNuevo.estado === 'ENTREGADO' && pedidoNuevo.conductorId) {
                    try {
                        console.log(`🔍 [Auditoría] Verificando entrega del pedido: ${pedidoId}`);
                        // 1. Extraer la última coordenada conocida del conductor en RTDB
                        const refConductor = rtdb.ref(`conductores_activos/${pedidoNuevo.conductorId}`);
                        const snapshotConductor = await refConductor.once('value');
                        const datosConductor = snapshotConductor.val();
                        console.log('Datos GPS conductor:', datosConductor);
                        await auditarEntrega({ pedido: pedidoNuevo, datosConductor, pedidoId, db, rtdb });
                    } catch (error) {
                        console.error("❌ [Error en Agente Antifraude]:", error);
                    }
                }
            }
        });
    });
};
