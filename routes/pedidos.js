// Endpoint raíz para monitorización
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Módulo de pedidos operativo y a la espera de instrucciones"
    });
});
import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

// GET /api/pedidos/activos/:uid
// Devuelve los pedidos activos asignados a un repartidor en RTDB
router.get('/activos/:uid', async (req, res) => {
    const uid = req.params.uid;
    if (!uid) return res.status(400).json({ error: 'uid requerido' });
    try {
        const db = admin.database();
        const snap = await db.ref('pedidos_en_camino').orderByChild('repartidor').equalTo(uid).once('value');
        const pedidos = snap.val() || {};
        return res.json({ ok: true, pedidos });
    } catch (e) {
        return res.status(500).json({ error: 'Error consultando pedidos', detalle: e.message });
    }
});

// Aquí se pueden agregar endpoints POST para notificaciones instantáneas


// POST /api/pedidos/reasignar
// Reasigna un pedido a otro repartidor disponible
router.post('/reasignar', async (req, res) => {
    const { pedidoId, nuevoRepartidorId } = req.body || {};
    if (!pedidoId || !nuevoRepartidorId) {
        return res.status(400).json({ error: 'Faltan datos: pedidoId y nuevoRepartidorId son requeridos' });
    }
    try {
        const dbRTDB = admin.database();
        const pedidoRef = dbRTDB.ref(`pedidos_en_camino/${pedidoId}`);
        const pedidoSnap = await pedidoRef.once('value');
        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado en pedidos_en_camino' });
        }
        const pedido = pedidoSnap.val();
        // Actualizar el repartidor asignado
        await pedidoRef.child('logistica/repartidor_id').set(nuevoRepartidorId);
        // Opcional: notificar por Discord
        if (alertaDiscord) {
            await alertaDiscord('🔄 Reasignación de pedido', `Pedido ${pedidoId} reasignado a repartidor ${nuevoRepartidorId}`);
        }
        return res.json({ ok: true, mensaje: `Pedido ${pedidoId} reasignado a ${nuevoRepartidorId}` });
    } catch (e) {
        console.error('[PEDIDOS][REASIGNAR] Error:', e.message);
        return res.status(500).json({ error: 'Error al reasignar pedido', detalle: e.message });
    }
});

export default router;
