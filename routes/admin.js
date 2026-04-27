const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// POST /api/admin/sentinel/boost
router.post('/sentinel/boost', async (req, res) => {
    const { zonaId, monto } = req.body;
    if (!zonaId || !monto) return res.status(400).json({ error: "Faltan datos de zona o monto" });
    try {
        // Lógica para alertar a todos los repartidores de esa zona
        console.log(`🚀 Lanzando Boost en ${zonaId} por $${monto}`);
        res.json({ success: true, message: `Boost activado en ${zonaId}` });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// POST /api/admin/users/register
router.post('/users/register', async (req, res) => {
    const { email, password, nombre } = req.body;
    try {
        const userRecord = await admin.auth().createUser({
            email,
            password,
            displayName: nombre
        });
        res.status(201).json({ success: true, uid: userRecord.uid });
    } catch (error) {
        res.status(400).json({ error: "Error al registrar usuario de prueba" });
    }
});

module.exports = router;
