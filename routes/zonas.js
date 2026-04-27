const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');
const db = admin.firestore();

// GET /api/zonas -> Para el Mapa de Calor
router.get('/', async (req, res) => {
    try {
        const zonasSnapshot = await db.collection('zonas_calor').get();
        const zonas = zonasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        // Si la colección está vacía, enviamos datos semilla de Tuxtla para que no de error
        if (zonas.length === 0) {
            return res.json([
                { nombre: "Centro", lat: 16.7527, lng: -93.1167, montoAcumulado: 4500 },
                { nombre: "Terán", lat: 16.7432, lng: -93.1678, montoAcumulado: 1200 }
            ]);
        }
        res.json(zonas);
    } catch (error) {
        res.status(500).json({ error: "Error al obtener zonas de calor" });
    }
});

module.exports = router;
