const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Inicializar Firebase Admin (usa credenciales del entorno)
admin.initializeApp();

const db = admin.database();
const firestore = admin.firestore();

// Jerarquía de niveles (ascendente, mayor valor = mayor prioridad)
const NIVEL_JERARQUIA = Object.freeze({
    BRONCE: 1,
    PLATA: 2,
    ORO: 3,
    DIAMANTE: 4,
});

const GEO_FENCE_METROS = 2000; // 2km

// === HELPERS ===

/**
 * Calcula distancia en metros entre dos puntos usando Haversine
 * @param {number} lat1 - Latitud punto 1
 * @param {number} lng1 - Longitud punto 1
 * @param {number} lat2 - Latitud punto 2
 * @param {number} lng2 - Longitud punto 2
 * @returns {number} Distancia en metros
 */
function distanciaMetrosHaversine(lat1, lng1, lat2, lng2) {
    const R = 6371000; // Radio de la Tierra en metros
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dp / 2) * Math.sin(dp / 2) +
        Math.cos(p1) * Math.cos(p2) *
        Math.sin(dl / 2) * Math.sin(dl / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

/**
 * Valida si las coordenadas son válidas
 */
function esCoordenadaValida(lat, lng) {
    return Number.isFinite(lat) && Number.isFinite(lng) &&
        lat >= -90 && lat <= 90 &&
        lng >= -180 && lng <= 180;
}

/**
 * Ordena repartidores por: distancia ascendente, luego por nivel descendente
 */
function ordenarRepartidores(repartidores) {
    return repartidores.sort((a, b) => {
        // Primero por distancia
        if (Math.abs(a.distancia - b.distancia) > 1) {
            return a.distancia - b.distancia;
        }
        // Si distancias similares, por nivel descendente
        const nivelA = NIVEL_JERARQUIA[a.nivel] || 0;
        const nivelB = NIVEL_JERARQUIA[b.nivel] || 0;
        return nivelB - nivelA; // Mayor nivel primero
    });
}

// === CLOUD FUNCTION: ASIGNADOR DE PEDIDOS ===

/**
 * Trigger: Se activa cuando se crea un documento en pedidos_activos (Firestore)
 * 
 * Flujo:
 * 1. Recibe evento de nuevo pedido
 * 2. Valida coordenadas del pedido
 * 3. Consulta repartidores disponibles
 * 4. Filtra por: isLibre === true, bloqueado_por_deuda === false
 * 5. Calcula distancia (Haversine) y filtra por geo-fence (2km)
 * 6. Ordena por distancia, luego por nivel
 * 7. Asigna al más cercano (o de nivel más alto si hay empate)
 * 8. Escribe asignación en RTDB y notifica
 */
exports.asignadorPedidos = functions
    .firestore
    .document('pedidos_activos/{pedidoId}')
    .onCreate(async (snap, context) => {
        const pedidoId = context.params.pedidoId;
        const pedido = snap.data();

        console.log(`[ASIGNADOR][${pedidoId}] Nuevo pedido detectado:`, pedido);

        try {
            // === PASO 1: Validar coordenadas del pedido ===
            const coordsPedido = pedido.cliente?.coords;
            if (!coordsPedido || !esCoordenadaValida(coordsPedido.lat, coordsPedido.lng)) {
                console.error(`[ASIGNADOR][${pedidoId}] Coordenadas inválidas:`, coordsPedido);
                await snap.ref.update({
                    estado_asignacion: 'ERROR_COORDS_INVALIDAS',
                    timestamp_error: admin.firestore.FieldValue.serverTimestamp(),
                });
                return;
            }

            // === PASO 2: Consultar repartidores disponibles ===
            const repartidoresRef = db.ref('repartidores');
            const repartidoresSnap = await repartidoresRef.once('value');
            const repartidoresData = repartidoresSnap.val() || {};

            console.log(`[ASIGNADOR][${pedidoId}] Total repartidores en BD:`, Object.keys(repartidoresData).length);

            // === PASO 3: Filtrar y calcular candidatos ===
            const candidatos = [];

            for (const [uid, repartidor] of Object.entries(repartidoresData)) {
                // Filtro 1: isLibre === true
                if (repartidor.isLibre !== true) {
                    continue;
                }

                // Filtro 2: bloqueado_por_deuda === false
                if (repartidor.bloqueado_por_deuda === true) {
                    continue;
                }

                // Validar ubicación actual
                const location = repartidor.currentLocation;
                if (!location || !esCoordenadaValida(location.lat, location.lng)) {
                    console.warn(`[ASIGNADOR][${pedidoId}] ${uid}: ubicación inválida`, location);
                    continue;
                }

                // Calcular distancia
                const distancia = distanciaMetrosHaversine(
                    coordsPedido.lat,
                    coordsPedido.lng,
                    location.lat,
                    location.lng
                );

                // Filtro 3: Geo-fence (2km)
                if (distancia > GEO_FENCE_METROS) {
                    console.debug(`[ASIGNADOR][${pedidoId}] ${uid}: fuera de rango (${(distancia / 1000).toFixed(2)}km)`);
                    continue;
                }

                candidatos.push({
                    uid,
                    nombre: repartidor.nombre || 'Sin nombre',
                    nivel: repartidor.nivel || 'BRONCE',
                    distancia,
                    isLibre: repartidor.isLibre,
                    bloqueado_por_deuda: repartidor.bloqueado_por_deuda,
                });

                console.debug(`[ASIGNADOR][${pedidoId}] ${uid}: ${repartidor.nombre} - ${repartidor.nivel} - ${(distancia / 1000).toFixed(2)}km`);
            }

            console.log(`[ASIGNADOR][${pedidoId}] Candidatos dentro del geo-fence:`, candidatos.length);

            if (candidatos.length === 0) {
                console.warn(`[ASIGNADOR][${pedidoId}] Sin repartidores disponibles`);
                await snap.ref.update({
                    estado_asignacion: 'NO_DISPONIBLES',
                    candidatos_count: 0,
                    timestamp_error: admin.firestore.FieldValue.serverTimestamp(),
                });
                return;
            }

            // === PASO 4: Ordenar por distancia y nivel ===
            const repartidoresOrdenados = ordenarRepartidores(candidatos);
            const repartidorAsignado = repartidoresOrdenados[0];

            console.log(`[ASIGNADOR][${pedidoId}] Asignado a:`, repartidorAsignado.uid, `(${repartidorAsignado.nombre}, ${repartidorAsignado.nivel}, ${(repartidorAsignado.distancia / 1000).toFixed(2)}km)`);

            // === PASO 5: Escribir asignación ===
            // Actualizar documento Firestore
            await snap.ref.update({
                estado_asignacion: 'ASIGNADO',
                repartidor_uid: repartidorAsignado.uid,
                repartidor_nombre: repartidorAsignado.nombre,
                repartidor_nivel: repartidorAsignado.nivel,
                distancia_metros: repartidorAsignado.distancia,
                candidatos_count: candidatos.length,
                timestamp_asignacion: admin.firestore.FieldValue.serverTimestamp(),
            });

            // Escribir en RTDB para notificar app del repartidor
            const assignmentRef = db.ref(`pedidos_asignados/${pedidoId}`);
            await assignmentRef.set({
                pedido_id: pedidoId,
                repartidor_uid: repartidorAsignado.uid,
                repartidor_nombre: repartidorAsignado.nombre,
                repartidor_nivel: repartidorAsignado.nivel,
                distancia_metros: repartidorAsignado.distancia,
                coordenadas_pedido: coordsPedido,
                timestamp: Date.now(),
                estado: 'PENDIENTE_ACEPTACION',
            });

            // === PASO 6: Notificar via FCM (opcional si hay fcm_token) ===
            const repartidorRef = db.ref(`repartidores/${repartidorAsignado.uid}`);
            const repartidorSnap = await repartidorRef.once('value');
            const repartidorFull = repartidorSnap.val();
            
            if (repartidorFull?.fcm_token) {
                try {
                    const message = {
                        notification: {
                            title: 'Nuevo Pedido',
                            body: `${repartidorAsignado.distancia < 1000 ? (repartidorAsignado.distancia / 1).toFixed(0) + 'm' : (repartidorAsignado.distancia / 1000).toFixed(2) + 'km'} de ti`,
                        },
                        data: {
                            pedido_id: pedidoId,
                            accion: 'NUEVO_PEDIDO',
                        },
                        token: repartidorFull.fcm_token,
                    };
                    await admin.messaging().send(message);
                    console.log(`[ASIGNADOR][${pedidoId}] Notificación FCM enviada a ${repartidorAsignado.uid}`);
                } catch (fcmError) {
                    console.error(`[ASIGNADOR][${pedidoId}] Error enviando FCM:`, fcmError.message);
                }
            }

            console.log(`[ASIGNADOR][${pedidoId}] ✅ Asignación completada exitosamente`);

        } catch (error) {
            console.error(`[ASIGNADOR][${pedidoId}] Error crítico:`, error);
            try {
                await snap.ref.update({
                    estado_asignacion: 'ERROR_INTERNO',
                    error_mensaje: error.message,
                    timestamp_error: admin.firestore.FieldValue.serverTimestamp(),
                });
            } catch (updateError) {
                console.error(`[ASIGNADOR][${pedidoId}] Error actualizando estado de error:`, updateError.message);
            }
        }
    });

// === FUNCIONES AUXILIARES PARA TESTING ===

/**
 * HTTP function para desencadenar pruebas (solo en desarrollo)
 */
exports.testAsignador = functions.https.onRequest(async (req, res) => {
    if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ error: 'Solo disponible en desarrollo' });
    }

    try {
        // Crear un pedido de prueba
        const testPedidoId = `test_asignador_${Date.now()}`;
        const testPedido = {
            id: testPedidoId,
            cliente: {
                nombre: 'Test Cliente',
                coords: {
                    lat: 16.7575, // Tuxtla Gutiérrez
                    lng: -93.1096,
                },
            },
            estado: 'ACTIVO',
            createdAt: admin.firestore.FieldValue.serverTimestamp(),
        };

        await firestore.collection('pedidos_activos').doc(testPedidoId).set(testPedido);

        res.json({
            success: true,
            mensaje: 'Pedido de prueba creado',
            pedidoId: testPedidoId,
            url: `https://console.firebase.google.com/firestore/data/pedidos_activos/${testPedidoId}`,
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
