import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

// Endpoint para notificar a repartidor vía FCM
router.post('/notificar-repartidor', async (req, res) => {
    try {
        const { tokenFCM, numeroPedido, direccion } = req.body;
        if (!tokenFCM || !numeroPedido || !direccion) {
            return res.status(400).json({ error: 'Faltan datos requeridos' });
        }
        const mensaje = {
            notification: {
                title: `Nuevo pedido #${numeroPedido}`,
                body: `Dirección: ${direccion}`
            },
            token: tokenFCM
        };
        const respuesta = await admin.messaging().send(mensaje);
        res.json({ ok: true, respuesta });
    } catch (error) {
        res.status(500).json({ ok: false, error: error.message });
    }
});

export default router;
