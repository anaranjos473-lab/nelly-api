// ROUTER LEGADO / COMPATIBILIDAD
// No usar para nuevas implementaciones.
// Este router es un stub de soporte y no es la fuente de verdad del flujo de pedidos.
import express from 'express';
const router = express.Router();

// 1. GET /api/pedidos (Estatus base)
router.get('/', (req, res) => {
    res.status(200).json({ success: true, message: "Módulo de pedidos Pedidos Nelly" });
});

// 2. POST /api/pedidos/reasignar (Lógica de ejemplo corregida)
router.post('/reasignar', async (req, res) => {
    try {
        const { pedidoId, nuevoRepartidorId } = req.body;
        // Aquí iría tu lógica de Firebase Realtime o Firestore
        return res.json({ ok: true, mensaje: `Pedido reasignado a ${nuevoRepartidorId}` });
    } catch (e) {
        return res.status(500).json({ error: 'Error al reasignar', detalle: e.message });
    }
});

export default router;
