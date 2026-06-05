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

// --- ENDPOINT: METRICAS DE PEDIDOS ---
router.get('/pedidos/metricas', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const admin = await getAdmin();
        const db = admin.database();
        const snapshot = await db.ref('pedidos_activos').once('value');
        const orders = snapshot.val() || {};

        return res.status(200).json({
            ok: true,
            activos: Object.keys(orders).length,
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

export default router;
