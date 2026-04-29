import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Módulo operativo"
    });
});

import admin from 'firebase-admin';

// POST /api/admin/sentinel/boost
router.post('/sentinel/boost', async (req, res) => {
    const { zonaId, monto } = req.body;
    if (!zonaId || !monto) {
        return res.status(400).json({ error: "Faltan datos críticos: zonaId o monto" });
    }
    try {
        await admin.firestore().collection('configuracion').doc('boost_actual').set({
            zonaId,
            monto,
            activo: true,
            timestamp: admin.firestore.FieldValue.serverTimestamp()
        });
        res.json({ success: true, message: `¡Boost de $${monto} lanzado en ${zonaId}!` });
    } catch (error) {
        res.status(500).json({ error: "Error interno al activar el Boost" });
    }
});

// POST /api/admin/users/register
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
        await admin.firestore().collection('usuarios').doc(userRecord.uid).set({
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
        res.status(400).json({ error: error.message });
    }
});

export default router;
