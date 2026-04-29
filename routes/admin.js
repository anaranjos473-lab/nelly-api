

import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

// No es necesario inicializar db aquí si ya lo hiciste en app.js, 
// pero lo declaramos para que el archivo sea independiente.
const db = admin.firestore();

/**
 * @route   POST /api/admin/sentinel/boost
 * @desc    Lanza un incentivo económico en una zona específica
 */
router.post('/sentinel/boost', async (req, res) => {
    const { zonaId, monto } = req.body;
    
    if (!zonaId || !monto) {
        return res.status(400).json({ error: "Faltan datos críticos: zonaId o monto" });
    }

    try {
        // Registro del Boost en Firestore para que los repartidores lo vean
        await db.collection('configuracion').doc('boost_actual').set({
            zonaId,
            monto,
            activo: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });

        console.log(`🚀 [SENTINEL] Boost activado en ${zonaId} por $${monto}`);
        res.json({ success: true, message: `¡Boost de $${monto} lanzado en ${zonaId}!` });
    } catch (error) {
        console.error("Error en Sentinel Boost:", error);
        res.status(500).json({ error: "Error interno al activar el Boost" });
    }
});

/**
 * @route   POST /api/admin/users/register
 * @desc    Registra usuarios o repartidores de prueba desde el Panel
 */
router.post('/users/register', async (req, res) => {
    const { email, password, nombre, rol } = req.body;

    if (!email || !password) {
        return res.status(400).json({ error: "Email y Password son obligatorios" });
    }

    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre || "Usuario Nelly"
        });

        // Guardar el rol en Firestore (Repartidor, Admin, Cliente)
        await db.collection('usuarios').doc(userRecord.uid).set({
            nombre: nombre || "Usuario Nelly",
            email,
            rol: rol || "DRIVER_TEST",
            fechaRegistro: admin.firestore.FieldValue.serverTimestamp()
        });

        res.status(201).json({ 
            success: true, 
            message: "Usuario creado exitosamente",
            uid: userRecord.uid 
        });
    } catch (error) {
        console.error("Error en Registro de Usuario:", error);
        res.status(400).json({ error: error.message });
    }
});

export default router;
