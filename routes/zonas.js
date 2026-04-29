// ...existing code...
// Ya tiene 'export default router;' al final, no requiere cambio.

import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();
const db = (admin.apps && admin.apps.length > 0) ? admin.firestore() : null;

/**
 * @route   GET /api/zonas
 * @desc    Obtiene los puntos de demanda para el Mapa de Calor
 */
router.get('/', async (req, res) => {
    if (!db) {
        return res.status(500).json({ error: "Firebase Admin no inicializado" });
    }
    try {
        const zonasSnapshot = await db.collection('zonas_calor').get();
        let zonas = zonasSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        if (zonas.length === 0) {
            zonas = [
                { nombre: "Centro Histórico", lat: 16.7527, lng: -93.1167, montoAcumulado: 4500 },
                { nombre: "Zona Terán", lat: 16.7432, lng: -93.1678, montoAcumulado: 2100 },
                { nombre: "Plaza Las Américas", lat: 16.7560, lng: -93.1415, montoAcumulado: 3200 }
            ];
        }
        console.log(`📡 [MAPA] Enviando ${zonas.length} zonas de demanda a Android.`);
        res.json(zonas);
    } catch (error) {
        console.error("Error en GET Zonas:", error);
        res.status(500).json({ error: "No se pudieron cargar las zonas de calor" });
    }
});

export default router;
