import admin from 'firebase-admin';
/**
 * PATCH /api/repartidores/estado
 * Actualiza la disponibilidad y ubicación del repartidor
 */
router.patch('/estado', async (req, res) => {
    const { uid, disponible, lat, lng, bateria } = req.body;
    try {
        const db = admin.database();
        const repartidorRef = db.ref(`repartidores/${uid}`);

        await repartidorRef.update({
            disponible,
            ultima_conexion: admin.database.ServerValue.TIMESTAMP,
            ubicacion: { lat, lng },
            meta: { bateria: bateria || 100 }
        });

        res.status(200).json({ success: true, message: "Estado de Nelly Repartidor actualizado" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});
import express from 'express';
const router = express.Router();

// Endpoint raíz para el monitor
router.get('/', (req, res) => {
    res.status(200).json({ 
        success: true, 
        profile: { displayName: "Repartidor Nelly", status: "online" } 
    });
});

// Endpoint para cerrar turno
router.post('/cerrar-turno', async (req, res) => {
    try {
        const { repartidorId } = req.body;
        if (!repartidorId) return res.status(400).send({ error: "Falta repartidorId" });

        res.status(200).send({ 
            status: "Success",
            message: "Turno cerrado correctamente"
        });
    } catch (error) {
        res.status(500).send({ error: "Error interno" });
    }
});

export default router;