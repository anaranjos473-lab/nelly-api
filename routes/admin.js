import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual } from '../src/services/debtLockService.js';

const router = express.Router();

// --- CONFIGURACIÓN DE EMAILS AUTORIZADOS ---
const PANEL_ADMIN_EMAILS = new Set(
    String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
        .split(',')
        .map(e => e.trim().toLowerCase())
);

// --- MIDDLEWARE: AUTENTICACIÓN PANEL ADMIN ---
const requirePanelAdminEmailAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    try {
        const admin = await getAdmin();
        console.log('[AUTH] Firebase Project ID:', process.env.FIREBASE_PROJECT_ID);
        console.log('[AUTH] Token recibido:', !!idToken);
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        console.log('[AUTH] Token verificado OK');
        console.log('[AUTH] UID:', decodedToken.uid);
        console.log('[AUTH] Email:', decodedToken.email);
        const email = String(decodedToken.email || '').trim().toLowerCase();

        if (!email || !PANEL_ADMIN_EMAILS.has(email)) {
            return res.status(403).json({ error: 'Acceso denegado: correo no autorizado' });
        }

        req.user = decodedToken;
        return next();
    } catch (error) {
        console.error('[AUTH ERROR Panel Admin Email]:', error);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

// --- ENDPOINT: PERFIL ADMIN ---
router.get('/', (req, res) => {
    const adminProfile = {
        displayName: "Administrador Nelly",
        status: "online"
    };
    res.status(200).json({ success: true, profile: adminProfile });
});

// --- ENDPOINT: LISTA DE REPARTIDORES ---
router.get('/repartidores', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        console.log('[ADMIN] Inicio /repartidores');
        const admin = await getAdmin();
        console.log('[ADMIN] Firebase Admin OK');
        const db = admin.database();

        console.log('[ADMIN] Leyendo usuarios/repartidores, repartidores y repartidores_activos');
        const [usuariosSnap, repartidoresSnap] = await Promise.all([
            db.ref('usuarios/repartidores').once('value'),
            db.ref('repartidores').once('value')
        ]);
        console.log('[ADMIN] Lectura de repartidores completada');

        const usuarios = usuariosSnap.val();
        const repartidores = repartidoresSnap.val();
        const drivers = {
            ...(repartidores && typeof repartidores === 'object' ? repartidores : {}),
            ...(usuarios && typeof usuarios === 'object' ? usuarios : {})
        };

        console.log('[ADMIN] Enviando respuesta /repartidores', {
            source: 'usuarios/repartidores+repartidores',
            total: Object.keys(drivers).length,
        });
        return res.status(200).json({
            ok: true,
            source: 'usuarios/repartidores+repartidores',
            drivers,
        });
    } catch (error) {
        console.error('[ADMIN][DRIVERS_LIST]', error);
        return res.status(500).json({
            ok: false,
            error: error.message,
        });
    }
});

// --- ENDPOINT: BLOQUEO MANUAL DE REPARTIDOR ---
router.post('/repartidores/manual-lock', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const uid = String(req.body?.uid || '').trim();
        const bloqueado = req.body?.bloqueado === true;

        if (!uid) {
            return res.status(400).json({ ok: false, error: 'uid es requerido' });
        }

        const admin = await getAdmin();
        const db = admin.database();
        const now = Date.now();
        const updates = {};

        updates[`repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`repartidores/${uid}/estatus/updated_at`] = now;
        updates[`repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        updates[`usuarios/repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/updated_at`] = now;
        updates[`usuarios/repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        await db.ref().update(updates);

        return res.status(200).json({ ok: true, uid, bloqueado });
    } catch (error) {
        console.error('[ADMIN][MANUAL_LOCK] Error:', error.message);
        return res.status(500).json({ ok: false, error: 'No se pudo actualizar bloqueo manual' });
    }
});

// --- ENDPOINT TEMPORAL DE DIAGNOSTICO DE DEUDA ---
router.get('/debug/deuda/:uid', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const uid = String(req.params.uid || '').trim();
        if (!uid) {
            return res.status(400).json({ ok: false, error: 'uid es requerido' });
        }

        const admin = await getAdmin();
        const db = admin.database();
        const snap = await db.ref(`repartidores/${uid}`).once('value');
        const driver = snap.val() || {};

        const deudaActual = Number(extraerDeudaActual(driver) || 0);
        const limiteDeuda = Number(driver?.finanzas?.limite_deuda || 0);
        const estatusBloqueado = driver?.estatus?.bloqueado_por_deuda === true;
        const perfilBloqueado = driver?.perfil?.bloqueado_por_deuda === true;
        const bloqueoManual = driver?.estatus?.bloqueo_manual === true || driver?.bloqueado_por_deuda === true;
        const bloqueoPorDeuda = estatusBloqueado || perfilBloqueado || (limiteDeuda > 0 && deudaActual > limiteDeuda);
        const totalNoElegible = bloqueoManual || bloqueoPorDeuda;
        let resultadoAcceptOrder = 'ALLOWED';
        let motivo = 'deuda_actual <= limite_deuda';
        if (estatusBloqueado) {
            resultadoAcceptOrder = 'BLOCKED_BY_DEBT';
            motivo = 'estatus.bloqueado_por_deuda';
        } else if (perfilBloqueado) {
            resultadoAcceptOrder = 'BLOCKED_BY_DEBT';
            motivo = 'perfil.bloqueado_por_deuda';
        } else if (limiteDeuda > 0 && deudaActual > limiteDeuda) {
            resultadoAcceptOrder = 'BLOCKED_BY_DEBT';
            motivo = 'deuda_actual > limite_deuda';
        }

        console.log('[ADMIN][DEBT_DEBUG]', {
            uid,
            deudaActual,
            limiteDeuda,
            estatusBloqueado,
            perfilBloqueado,
            bloqueoManual,
            bloqueoPorDeuda,
            totalNoElegible,
            resultadoAcceptOrder,
            motivo
        });

        return res.status(200).json({
            ok: true,
            uid,
            deuda_actual: deudaActual,
            limite_deuda: limiteDeuda,
            bloqueo_manual: bloqueoManual,
            bloqueo_por_deuda: bloqueoPorDeuda,
            total_no_elegible: totalNoElegible,
            estatus_bloqueado_por_deuda: estatusBloqueado,
            perfil_bloqueado_por_deuda: perfilBloqueado,
            motivo,
            resultado_accept_order: resultadoAcceptOrder,
            bloqueado_por_deuda: resultadoAcceptOrder === 'BLOCKED_BY_DEBT'
        });
    } catch (error) {
        console.error('[ADMIN][DEBT_DEBUG] Error:', error.message);
        return res.status(500).json({ ok: false, error: 'No se pudo leer el estado de deuda' });
    }
});

// --- UTILIDADES DE METRICAS ---
const parseTimestamp = (value) => {
    if (value == null) return null;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    const parsed = Date.parse(String(value));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

class ValidationError extends Error {}

const getOrderTimestamp = (pedido, keys) => {
    if (!pedido || typeof pedido !== 'object') return null;
    for (const key of keys) {
        const candidate = pedido[key];
        const timestamp = parseTimestamp(candidate);
        if (timestamp) return timestamp;
    }
    const logistica = pedido.logistica;
    if (logistica && typeof logistica === 'object') {
        for (const key of keys) {
            const candidate = logistica[key];
            const timestamp = parseTimestamp(candidate);
            if (timestamp) return timestamp;
        }
    }
    return null;
};

const normalizeEstado = (pedido) => {
    const values = [pedido?.estado, pedido?.estado_pedido, pedido?.logistica?.estado];
    for (const raw of values) {
        if (!raw) continue;
        const estado = String(raw).trim().toLowerCase();
        if (estado) return estado;
    }
    return '';
};

const isDeliveredState = (pedido) => {
    const estado = normalizeEstado(pedido);
    return estado === 'entregado';
};

const isCancelledState = (pedido) => {
    const estado = normalizeEstado(pedido);
    return estado === 'cancelado';
};

const getTodayStartMexicoCity = () => {
    const formatter = new Intl.DateTimeFormat('sv', {
        timeZone: 'America/Mexico_City',
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    });
    const formatted = formatter.format(new Date());
    const iso = formatted.replace(' ', 'T');
    const mexicoNow = new Date(`${iso}.000`);
    return new Date(mexicoNow.getFullYear(), mexicoNow.getMonth(), mexicoNow.getDate(), 0, 0, 0, 0).getTime();
};

const isFraudAlert = (pedido) => {
    if (pedido == null || typeof pedido !== 'object') return false;
    if (pedido.alertaFraude === true) return true;
    return String(pedido.alertaFraude || '').trim().toLowerCase() === 'true';
};

// --- ENDPOINT: METRICAS DE PEDIDOS ---
router.get('/pedidos/metricas', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const admin = await getAdmin();
        const db = admin.database();
        const [pedidosSnap, pedidosActivosSnap, conductoresSnap] = await Promise.all([
            db.ref('pedidos').once('value'),
            db.ref('pedidos_activos').once('value'),
            db.ref('conductores_activos').once('value')
        ]);

        const pedidosObj = pedidosSnap.val() || {};
        const pedidosActivosObj = pedidosActivosSnap.val() || {};
        const conductoresObj = conductoresSnap.val() || {};

        const todayStart = getTodayStartMexicoCity();

        let pedidosCreadosHoy = 0;
        let pedidosEntregadosHoy = 0;
        let pedidosCanceladosHoy = 0;
        let fraudesDetectadosHoy = 0;
        let totalAssignmentMinutes = 0;
        let assignmentCount = 0;
        let totalDeliveryMinutes = 0;
        let deliveryCount = 0;

        Object.values(pedidosObj).forEach((pedido) => {
            const createdAt = getOrderTimestamp(pedido, ['createdAt', 'created_at', 'fecha_creacion', 'fechaCreacion', 'fecha_creado', 'created_at']);
            const assignedAt = getOrderTimestamp(pedido, ['aceptado_en', 'tomado_en', 'aceptadoEn', 'tomadoEn', 'repartidor_asignado_en']);
            const deliveredAt = getOrderTimestamp(pedido, ['entregado_en', 'entregadoEn']);
            const isDelivered = isDeliveredState(pedido);
            const isCancelled = isCancelledState(pedido);
            const fraudAlert = isFraudAlert(pedido);

            if (createdAt && createdAt >= todayStart) {
                pedidosCreadosHoy += 1;
            }

            if (deliveredAt && deliveredAt >= todayStart) {
                pedidosEntregadosHoy += 1;
            } else if (isDelivered && createdAt && createdAt >= todayStart) {
                pedidosEntregadosHoy += 1;
            }

            if (isCancelled && createdAt && createdAt >= todayStart) {
                pedidosCanceladosHoy += 1;
            }

            if (fraudAlert && deliveredAt && deliveredAt >= todayStart) {
                fraudesDetectadosHoy += 1;
            }

            if (createdAt && assignedAt && assignedAt >= createdAt) {
                totalAssignmentMinutes += (assignedAt - createdAt) / 60000;
                assignmentCount += 1;
            }

            if (assignedAt && deliveredAt && deliveredAt >= assignedAt) {
                totalDeliveryMinutes += (deliveredAt - assignedAt) / 60000;
                deliveryCount += 1;
            }
        });

        const avgAsignacionMinutos = assignmentCount > 0 ? Number((totalAssignmentMinutes / assignmentCount).toFixed(1)) : 0;
        const avgEntregaMinutos = deliveryCount > 0 ? Number((totalDeliveryMinutes / deliveryCount).toFixed(1)) : 0;

        return res.status(200).json({
            ok: true,
            activos: Object.keys(pedidosActivosObj).length,
            pedidosCreadosHoy,
            pedidosEntregadosHoy,
            pedidosCanceladosHoy,
            avgAsignacionMinutos,
            avgEntregaMinutos,
            conductoresActivos: Object.keys(conductoresObj).length,
            fraudesDetectadosHoy
        });
    } catch (error) {
        console.error('[ADMIN][ORDERS_METRICS] Error:', error.message);
        return res.status(500).json({ error: 'No se pudieron obtener las metricas de pedidos' });
    }
});

// --- ENDPOINT: METRICAS DE RENTABILIDAD ---
router.get('/metricas/rentabilidad', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const admin = await getAdmin();
        const db = admin.database();

        const [
            finanzasSnap,
            historialSnap
        ] = await Promise.all([
            db.ref('finanzas').once('value'),
            db.ref('historial_ventas').once('value')
        ]);

        const finanzas = finanzasSnap.val() || {};
        const historial = historialSnap.val() || {};

        const ventasBrutas = Number(finanzas.ingresosHoy || 0);

        const conteoEntregas = Object.keys(historial).length;

        const metrics = {
            ventasBrutas,
            comisionesNelly: +(ventasBrutas * 0.15).toFixed(2),
            conteoEntregas,
            mapaCalor: {}
        };

        console.log(
            `[FINANZAS] 💰 Corte de caja generado: $${metrics.ventasBrutas} brutos.`
        );

        return res.status(200).json(metrics);

    } catch (error) {
        console.error("🔥 Error en Dashboard Financiero:", error);
        return res.status(500).json({
            error: "No se pudo calcular la rentabilidad"
        });
    }
});

function generateShortId(timestamp) {
    const date = new Date(Number(timestamp) || Date.now());
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const day = String(date.getUTCDate()).padStart(2, '0');
    const suffix = String(Math.floor(Math.random() * 90) + 10);
    return `${month}${day}-${suffix}`;
}

// --- ENDPOINT: CREAR PEDIDO ---
router.post('/pedidos', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const {
            cliente_nombre,
            telefono,
            direccion,
            descripcion,
            cliente_lat,
            cliente_lng,
            tienda_lat,
            tienda_lng,
            items,
            subtotal,
            costo_envio,
            propina,
            total,
            pago
        } = req.body;

        if (!cliente_nombre || !telefono || !direccion) {
            return res.status(400).json({ error: 'Faltan campos de cliente obligatorios' });
        }

        const coordenadas = {
            clienteLat: Number(cliente_lat),
            clienteLng: Number(cliente_lng),
            tiendaLat: Number(tienda_lat),
            tiendaLng: Number(tienda_lng)
        };
        const coordenadaValida = (lat, lng) => Number.isFinite(lat) && Number.isFinite(lng) &&
            lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180 && lat !== 0 && lng !== 0;
        if (!coordenadaValida(coordenadas.clienteLat, coordenadas.clienteLng) ||
            !coordenadaValida(coordenadas.tiendaLat, coordenadas.tiendaLng)) {
            return res.status(400).json({ error: 'Coordenadas operativas de cliente y tienda obligatorias' });
        }

        if (!Array.isArray(items) || items.length === 0) {
            return res.status(400).json({ error: 'El pedido debe contener al menos un item' });
        }

        const normalizedItems = items.map((item, index) => {
            if (!item || typeof item !== 'object') {
                throw new Error(`Item ${index + 1} invalido`);
            }
            const nombre = String(item.nombre || item.name || '').trim();
            const cantidad = Number(item.cantidad || item.quantity || 0);
            const precio = Number(item.precio || item.price || 0);

            if (!nombre || !Number.isFinite(cantidad) || cantidad <= 0 || !Number.isFinite(precio) || precio <= 0) {
                throw new Error(`Item ${index + 1} incompleto o con valores invalidos`);
            }

            return {
                nombre,
                cantidad,
                precio: Number(precio.toFixed(2))
            };
        });

        if (!Number.isFinite(subtotal) || subtotal <= 0) {
            return res.status(400).json({ error: 'Subtotal invalido' });
        }

        if (!Number.isFinite(costo_envio) || costo_envio < 0) {
            return res.status(400).json({ error: 'Costo de envio invalido' });
        }

        if (!Number.isFinite(propina) || propina < 0) {
            return res.status(400).json({ error: 'Propina invalida' });
        }

        const expectedSubtotal = Number(normalizedItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
        if (Math.abs(expectedSubtotal - Number(subtotal)) > 0.01) {
            return res.status(400).json({ error: 'Subtotal no coincide con la suma de items' });
        }

        const expectedTotal = Number((Number(subtotal) + Number(costo_envio) + Number(propina)).toFixed(2));
        if (!Number.isFinite(total) || Math.abs(expectedTotal - Number(total)) > 0.01) {
            return res.status(400).json({ error: 'Total invalido o no coincide con subtotal + envio + propina' });
        }

        if (!pago || typeof pago !== 'object' || !pago.metodo || !pago.estado) {
            return res.status(400).json({ error: 'Informacion de pago incompleta' });
        }

        const admin = await getAdmin();
        const db = admin.database();

        const timestamp = Date.now();
        const pedidoId = `PED_${timestamp}`;

        const nuevoPedido = {
            id: pedidoId,
            id_pedido: pedidoId,
            pedido_id: pedidoId,
            shortId: generateShortId(timestamp),
            cliente_nombre: String(cliente_nombre).trim(),
            cliente: String(cliente_nombre).trim(),
            telefono: String(telefono).trim(),
            direccion: String(direccion).trim(),
            lat: coordenadas.clienteLat,
            lng: coordenadas.clienteLng,
            latTienda: coordenadas.tiendaLat,
            lngTienda: coordenadas.tiendaLng,
            descripcion: String(descripcion || '').trim(),
            items: normalizedItems,
            subtotal: Number(Number(subtotal).toFixed(2)),
            costo_envio: Number(Number(costo_envio).toFixed(2)),
            propina: Number(Number(propina).toFixed(2)),
            monto: Number(Number(total).toFixed(2)),
            total: Number(Number(total).toFixed(2)),
            monto_total: Number(Number(total).toFixed(2)),
            pago: {
                metodo: String(pago.metodo).trim(),
                estado: String(pago.estado).trim()
            },
            estado: 'pendiente',
            estado_pedido: 'PENDIENTE',
            fase_panel: 'Pendiente',
            repartidor_id: null,
            conductorId: null,
            pedido_activo: null,
            fecha_creacion: timestamp,
            createdAt: timestamp,
            created_at: timestamp,
            origen: 'panel_admin',
            logistica: {
                estado: 'pendiente',
                repartidor_id: null
            }
        };

        await db.ref(`pedidos/${pedidoId}`).set(nuevoPedido);

        console.log(`[ADMIN] Pedido creado: ${pedidoId}`);

        return res.status(201).json({ ok: true, id: pedidoId, pedido: nuevoPedido });
    } catch (error) {
        console.error('[ADMIN][CREATE_ORDER] Error:', error.message);
        if (error instanceof ValidationError) {
            return res.status(400).json({ error: error.message });
        }
        return res.status(500).json({ error: 'No se pudo crear el pedido' });
    }
});

export default router;
