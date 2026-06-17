import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';

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

        console.log('[ADMIN] Leyendo repartidores_activos');
        const activosSnap = await db.ref('repartidores_activos').once('value');
        console.log('[ADMIN] Lectura repartidores_activos completada');

        const activos = activosSnap.val();
        const drivers = activos || {};

        console.log('[ADMIN] Enviando respuesta /repartidores', {
            source: 'repartidores_activos',
            total: Object.keys(drivers).length,
        });
        return res.status(200).json({
            ok: true,
            source: 'repartidores_activos',
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

// --- UTILIDADES DE METRICAS ---
const parseTimestamp = (value) => {
    if (value == null) return null;
    const numeric = Number(value);
    if (Number.isFinite(numeric) && numeric > 0) return numeric;
    const parsed = Date.parse(String(value));
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null;
};

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

// --- ENDPOINT: CREAR PEDIDO ---
router.post('/pedidos', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const { cliente_nombre, telefono, direccion, monto, descripcion } = req.body;

        if (!cliente_nombre || !telefono || !direccion || typeof monto !== 'number') {
            return res.status(400).json({ error: 'Faltan campos obligatorios o formato invalido' });
        }

        const admin = await getAdmin();
        const db = admin.database();

        const timestamp = Date.now();
        const pedidoId = `PED_${timestamp}`;

        const nuevoPedido = {
            id: pedidoId,
            cliente_nombre: String(cliente_nombre).trim(),
            telefono: String(telefono).trim(),
            direccion: String(direccion).trim(),
            descripcion: String(descripcion || '').trim(),
            monto: Number(monto.toFixed(2)),
            estado: 'pendiente',
            repartidor_id: null,
            fecha_creacion: timestamp,
            origen: 'panel_admin'
        };

        await db.ref(`pedidos/${pedidoId}`).set(nuevoPedido);

        console.log(`[ADMIN] Pedido creado: ${pedidoId}`);

        return res.status(201).json({ ok: true, id: pedidoId, pedido: nuevoPedido });
    } catch (error) {
        console.error('[ADMIN][CREATE_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo crear el pedido' });
    }
});

// --- ENDPOINT: MARCAR PEDIDO COMO LISTO Y MOVER A pedidos_para_reparto ---
router.post('/pedidos/:pedidoId/listo', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const { pedidoId } = req.params;
        
        if (!pedidoId) {
            return res.status(400).json({ error: 'pedidoId es requerido' });
        }

        const admin = await getAdmin();
        const db = admin.database();

        // Leer el pedido actual
        const pedidoSnap = await db.ref(`pedidos/${pedidoId}`).once('value');
        const pedido = pedidoSnap.val();

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const timestamp = Date.now();
        const pedidoActualizado = {
            ...pedido,
            estado: 'LISTO',
            estado_pedido: 'LISTO',
            fecha_listo: timestamp,
            timestamp_listo: timestamp
        };

        // Actualizar en ambos nodos en una transacción
        const updates = {
            [`pedidos/${pedidoId}`]: pedidoActualizado,
            [`pedidos_para_reparto/${pedidoId}`]: pedidoActualizado
        };

        await db.ref().update(updates);

        console.log(`[ADMIN] Pedido ${pedidoId} marcado como LISTO y disponible para drivers`);

        return res.status(200).json({ 
            ok: true, 
            id: pedidoId, 
            pedido: pedidoActualizado,
            message: 'Pedido listo para entrega. Los drivers pueden verlo ahora.'
        });
    } catch (error) {
        console.error('[ADMIN][MARK_LISTO] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo marcar el pedido como listo' });
    }
});

// --- ENDPOINT: CIERRE DE PEDIDO (Eliminar después de entrega confirmada) ---
router.post('/pedidos/:pedidoId/cierre', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const { pedidoId } = req.params;
        const { adminEmail } = req.body || {};
        
        if (!pedidoId) {
            return res.status(400).json({ error: 'pedidoId es requerido' });
        }

        const admin = await getAdmin();
        const db = admin.database();

        // Leer el pedido actual para validar estado
        const pedidoSnap = await db.ref(`pedidos/${pedidoId}`).once('value');
        const pedido = pedidoSnap.val();

        if (!pedido) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        // Validar que el pedido está ENTREGADO antes de cerrar
        if (pedido.estado !== 'ENTREGADO' && pedido.estado !== 'COMPLETADO') {
            return res.status(400).json({ 
                error: `No se puede cerrar pedido en estado ${pedido.estado}. Debe estar ENTREGADO.`,
                estado_actual: pedido.estado
            });
        }

        const timestamp = Date.now();

        // Crear evento de auditoría ANTES de eliminar
        const version = (pedido.version || 0) + 1;
        const cierreEvent = {
            tipo: 'CIERRE_PEDIDO',
            actor: req.user?.email || 'admin-panel',
            actor_uid: req.user?.uid || 'unknown',
            pedido_id: pedidoId,
            estado_previo: pedido.estado,
            timestamp: timestamp,
            razon: 'Cierre confirmado por panel admin'
        };

        // Eliminar pedido y crear evento ATÓMICAMENTE
        const updates = {
            [`pedidos/${pedidoId}`]: null,
            [`pedidos_para_reparto/${pedidoId}`]: null,
            [`order_events/${pedidoId}/${version}`]: cierreEvent
        };

        await db.ref().update(updates);

        console.log(`[ADMIN] Pedido ${pedidoId} cerrado. Evento de auditoría creado.`);

        return res.status(200).json({ 
            ok: true, 
            id: pedidoId,
            message: 'Pedido cerrado correctamente',
            version: version,
            timestamp: timestamp
        });
    } catch (error) {
        console.error('[ADMIN][CIERRE] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo cerrar el pedido' });
    }
});

export default router;
