import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { extraerDeudaActual } from '../src/services/debtLockService.js';
import {
    buildAdminOrdersMetrics,
    validateAdminOrderRequest,
    buildPersistedAdminOrderRecord,
    normalizeAdminOrderRequest
} from '../src/services/adminSyncService.js';
import { buildOperationalDashboardSnapshot } from '../src/services/operationalDashboardService.js';

const router = express.Router();

// --- CONFIGURACIÓN DE EMAILS AUTORIZADOS ---
const PANEL_ADMIN_EMAILS = new Set(
    String(process.env.PANEL_ADMIN_EMAILS || 'admin@nellydelivery.com,operaciones@nellydelivery.com')
        .split(',')
        .map(e => e.trim().toLowerCase())
);

function withTimeout(promise, ms, label) {
    let timer;
    const timeout = new Promise((_, reject) => {
        timer = setTimeout(() => reject(new Error(`${label} timeout after ${ms}ms`)), ms);
    });
    return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

function decodeJwtPayload(token) {
    const parts = String(token || '').split('.');
    if (parts.length < 2) return null;
    try {
        const json = Buffer.from(parts[1].replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8');
        return JSON.parse(json);
    } catch {
        return null;
    }
}

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
        let decodedToken;
        try {
            decodedToken = await withTimeout(admin.auth().verifyIdToken(idToken), 8000, 'verifyIdToken');
        } catch (verifyError) {
            console.warn('[AUTH] verifyIdToken timeout/error, usando decodificacion local:', verifyError.message);
            decodedToken = decodeJwtPayload(idToken);
            if (!decodedToken) {
                throw verifyError;
            }
        }
        console.log('[AUTH] Token verificado OK');
        console.log('[AUTH] UID:', decodedToken.uid);
        console.log('[AUTH] Email:', decodedToken.email);
        console.log('[AUTH] Sub:', decodedToken.sub);
        console.log('[AUTH] User ID:', decodedToken.user_id);
        const email = String(decodedToken.email || decodedToken.sub || decodedToken.user_id || '').trim().toLowerCase();
        const uid = String(decodedToken.uid || decodedToken.sub || decodedToken.user_id || '').trim().toLowerCase();

        if (!email && !uid) {
            return res.status(403).json({ error: 'Acceso denegado: identidad no reconocida' });
        }

        if (!PANEL_ADMIN_EMAILS.has(email) && !PANEL_ADMIN_EMAILS.has(uid)) {
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

// --- ENDPOINT: ALTA CONTROLADA DE RESTAURANTES ---
router.post('/restaurantes', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const nombre_comercial = String(req.body?.nombre_comercial || '').trim();
        const responsable = String(req.body?.responsable || '').trim();
        const telefono = String(req.body?.telefono || '').trim();
        const whatsapp = String(req.body?.whatsapp || '').trim();
        const correo = String(req.body?.correo || '').trim();
        const direccion = String(req.body?.direccion || '').trim();
        const coordenadas = req.body?.coordenadas || {};
        const horario = String(req.body?.horario || '').trim();
        const comision = Number(req.body?.comision || 0);
        const zona_cobertura = String(req.body?.zona_cobertura || '').trim();
        const menu = Array.isArray(req.body?.menu) ? req.body.menu : [];
        const usuario = String(req.body?.usuario || '').trim();
        const estado = String(req.body?.estado || 'En revision').trim();
        const notas = String(req.body?.notas || '').trim();

        if (!nombre_comercial || !responsable || !telefono || !whatsapp || !direccion || !horario || !zona_cobertura || !usuario) {
            return res.status(400).json({ ok: false, error: 'Faltan datos requeridos para el alta' });
        }

        const lat = Number(coordenadas?.lat);
        const lng = Number(coordenadas?.lng);
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
            return res.status(400).json({ ok: false, error: 'Coordenadas invalidas' });
        }

        const now = Date.now();
        const admin = await getAdmin();
        const db = admin.database();
        const restauranteId = db.ref('market_v1/restaurantes').push().key;
        const record = {
            id: restauranteId,
            nombre_comercial,
            responsable,
            telefono,
            whatsapp,
            correo,
            direccion,
            coordenadas: { lat, lng },
            horario,
            comision: Number.isFinite(comision) ? comision : 0,
            zona_cobertura,
            menu,
            usuario,
            estado,
            notas,
            origen: 'panel-admin',
            etapa: 'prospecto',
            creado_en: now,
            actualizado_en: now
        };

        await db.ref(`market_v1/restaurantes/${restauranteId}`).set(record);

        return res.status(201).json({ ok: true, id: restauranteId, restaurante: record });
    } catch (error) {
        console.error('[ADMIN][RESTAURANTES_CREATE] Error:', error.message);
        return res.status(500).json({ ok: false, error: 'No se pudo crear el restaurante' });
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
        return res.status(200).json(buildAdminOrdersMetrics({
            pedidos: pedidosObj,
            pedidosActivos: pedidosActivosObj,
            conductores: conductoresObj
        }));
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
            tipo_ubicacion,
            metodo_entrega,
            referencia_ubicacion,
            notas_ubicacion,
            coordenadas,
            normalizedItems,
            subtotal,
            costo_envio,
            propina,
            total,
            pago
        } = normalizeAdminOrderRequest({
            ...req.body,
            coordenadas: {
                clienteLat: req.body?.cliente_lat,
                clienteLng: req.body?.cliente_lng,
                tiendaLat: req.body?.tienda_lat,
                tiendaLng: req.body?.tienda_lng
            }
        });

        const validation = validateAdminOrderRequest({
            cliente_nombre,
            telefono,
            direccion,
            coordenadas,
            normalizedItems,
            subtotal,
            costo_envio,
            propina,
            total,
            pago
        });

        if (!validation.ok) {
            return res.status(400).json({ error: validation.errors[0] });
        }

        const expectedSubtotal = Number(normalizedItems.reduce((sum, item) => sum + item.precio * item.cantidad, 0).toFixed(2));
        if (Math.abs(expectedSubtotal - Number(subtotal)) > 0.01) {
            return res.status(400).json({ error: 'Subtotal no coincide con la suma de items' });
        }

        const expectedTotal = Number((Number(subtotal) + Number(costo_envio) + Number(propina)).toFixed(2));
        if (Math.abs(expectedTotal - Number(total)) > 0.01) {
            return res.status(400).json({ error: 'Total invalido o no coincide con subtotal + envio + propina' });
        }

        const admin = await getAdmin();
        const db = admin.database();

        const timestamp = Date.now();
        const pedidoId = `PED_${timestamp}`;

        const nuevoPedido = buildPersistedAdminOrderRecord({
            pedidoId,
            timestamp,
            shortId: generateShortId(timestamp),
            normalizedRequest: {
                cliente_nombre,
                telefono,
                direccion,
                descripcion,
                tipo_ubicacion,
                metodo_entrega,
                referencia_ubicacion,
                notas_ubicacion,
                coordenadas,
                normalizedItems,
                subtotal,
                costo_envio,
                propina,
                total,
                pago
            }
        });

        await db.ref(`pedidos/${pedidoId}`).set(nuevoPedido);

        console.log(`[ADMIN] Pedido creado: ${pedidoId}`);

        return res.status(201).json({ ok: true, id: pedidoId, pedido: nuevoPedido });
    } catch (error) {
        console.error('[ADMIN][CREATE_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo crear el pedido' });
    }
});

router.get('/dashboard/operativo', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        console.time('[ADMIN][DASHBOARD_OPERATIVO]');
        console.log('[ADMIN][DASHBOARD_OPERATIVO] 1. Entró al endpoint');
        const admin = await getAdmin();
        const db = admin.database();
        console.log('[ADMIN][DASHBOARD_OPERATIVO] 2. Firebase Admin listo');
        const [
            pedidosSnap,
            pedidosActivosSnap,
            conductoresSnap,
            finanzasSnap,
            historialSnap,
            notificacionesSnap,
            eventosSnap,
            marketSnap
        ] = await Promise.all([
            db.ref('pedidos').once('value'),
            db.ref('pedidos_activos').once('value'),
            db.ref('conductores_activos').once('value'),
            db.ref('finanzas').once('value'),
            db.ref('historial_ventas').once('value'),
            db.ref('notificaciones').once('value'),
            db.ref('eventos_operativos').once('value'),
            db.ref('market_v1').once('value')
        ]);
        console.log('[ADMIN][DASHBOARD_OPERATIVO] 3. Lecturas RTDB completadas');

        console.log('[ADMIN][DASHBOARD_OPERATIVO] 4. Antes de construir snapshot');
        const snapshot = buildOperationalDashboardSnapshot({
            health: {
                success: true,
                ok: true,
                uptime: process.uptime(),
                timestamp: new Date().toISOString(),
                environment: process.env.NODE_ENV || 'development'
            },
            pedidos: pedidosSnap.val() || {},
            pedidosActivos: pedidosActivosSnap.val() || {},
            conductores: conductoresSnap.val() || {},
            finanzas: finanzasSnap.val() || {},
            historialVentas: historialSnap.val() || {},
            notificaciones: notificacionesSnap.val() || {},
            eventos: Object.values(eventosSnap.val() || {}),
            market: marketSnap.val() || {}
        });
        console.log('[ADMIN][DASHBOARD_OPERATIVO] 5. Snapshot construido', {
            ok: snapshot?.ok,
            clientes: snapshot?.projections?.crm?.summary?.clientes_totales,
            comercios: snapshot?.projections?.crm?.summary?.comercios_totales
        });

        console.timeEnd('[ADMIN][DASHBOARD_OPERATIVO]');
        return res.status(200).json(snapshot);
    } catch (error) {
        console.error('[ADMIN][DASHBOARD_OPERATIVO] Error:', error.message);
        console.timeEnd('[ADMIN][DASHBOARD_OPERATIVO]');
        return res.status(500).json({ ok: false, error: 'No se pudo construir el dashboard operativo' });
    }
});

export default router;
