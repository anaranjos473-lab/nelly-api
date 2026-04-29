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