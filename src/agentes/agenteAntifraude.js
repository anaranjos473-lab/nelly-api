import { getAdmin } from '../../config/firebase-admin-esm.js';

// Reutilizamos la fórmula de Haversine para la auditoría
const calcularDistancia = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radio de la Tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(Math.sqrt(a) * Math.sqrt(1 - a)), Math.sqrt(1 - a));
    return R * c;
};

export const auditarEntrega = async ({ pedido, datosConductor, pedidoId, rtdb }) => {
    if (!datosConductor || !datosConductor.lat || !datosConductor.lng) {
        console.log(`⚠️ [Alerta Menor] GPS no encontrado para el conductor ${pedido.conductorId} en el momento de la entrega.`);
        return { alerta: 'gps_faltante' };
    }

    const latDestino = pedido.latCliente || pedido.latTienda || pedido.lat_cliente || pedido.lat;
    const lngDestino = pedido.lngCliente || pedido.lngTienda || pedido.lng_cliente || pedido.lng;
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
        if (rtdb) {
            const refConductor = rtdb.ref(`conductores_activos/${pedido.conductorId}`);
            await rtdb.ref(`pedidos/${pedidoId}`).update({
                alertaFraude: true,
                distanciaFalloKm: distanciaReal,
                notasAuditoria: 'Marcado como entregado fuera del radio permitido.'
            });
            await refConductor.update({ estado: 'EN_REVISION' });
        }
        return { alerta: 'fraude', distancia: distanciaReal };
    }

    console.log(`✅ [Entrega Legítima] Pedido ${pedidoId} entregado a ${distanciaReal.toFixed(2)} km del objetivo.`);
    return { alerta: 'ok', distancia: distanciaReal };
};

export const iniciarAgenteAntifraude = async () => {
    const admin = await getAdmin();
    const rtdb = admin.database();
    console.log('🛡️ [Agente Antifraude] Guardián de telemetría activado.');

    const pedidosRef = rtdb.ref('pedidos');
    pedidosRef.on('child_changed', async (snapshot) => {
        const pedidoNuevo = snapshot.val();
        const pedidoId = snapshot.key;
        if (!pedidoNuevo || pedidoNuevo.estado !== 'entregado' || !pedidoNuevo.conductorId) {
            return;
        }

        try {
            console.log(`🔍 [Auditoría] Verificando entrega del pedido: ${pedidoId}`);
            const conductorSnap = await rtdb.ref(`conductores_activos/${pedidoNuevo.conductorId}`).once('value');
            const datosConductor = conductorSnap.val();
            console.log('Datos GPS conductor:', datosConductor);
            await auditarEntrega({ pedido: pedidoNuevo, datosConductor, pedidoId, rtdb });
        } catch (error) {
            console.error('❌ [Error en Agente Antifraude]:', error);
        }
    });
};
