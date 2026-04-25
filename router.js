const express = require('express');
const router = express.Router();

const admin = require('firebase-admin');

// --- ENDPOINT: REPORTE FINANCIERO REAL ---
router.get('/reporte-financiero', async (req, res) => {
    try {
        const hoy = new Date();
        hoy.setHours(0, 0, 0, 0); // Inicio del día

        // Consulta pedidos del día que estén finalizados
        const snapshot = await admin.firestore().collection('pedidos')
            .where('fecha', '>=', admin.firestore.Timestamp.fromDate(hoy))
            .where('estado', '==', 'entregado')
            .get();

        let ventasBrutas = 0;
        let pedidosConcluidos = snapshot.size;

        snapshot.forEach(doc => {
            ventasBrutas += doc.data().total || 0;
        });

        // Comisión FIJA 18%
        const utilidadNelly = ventasBrutas * 0.18;

        res.json({
            success: true,
            ventas_brutas: ventasBrutas,
            utilidad_nelly: utilidadNelly,
            pedidos_concluidos: pedidosConcluidos,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("Error en reporte:", error);
        res.status(500).json({ success: false, message: error.message });
    }
});



router.get('/zonas', async (req, res) => {
    try {
        const snapshot = await admin.firestore().collection('zonas').get();
        const listaZonas = snapshot.docs.map(doc => doc.data().nombre);
        res.json(listaZonas.length > 0 ? listaZonas : ["Sin zonas configuradas"]);
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
});

const dotenv = require('dotenv');
dotenv.config();

// --- DEPENDENCIAS Y VARIABLES GLOBALES ---
const axios = require('axios');
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// --- FUNCIONES DE ALERTA ---
async function notificarAlertaConexion(mensaje) {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `🚨 **ALERTA NELLY**: ${mensaje}`
        });
    } catch (e) {
        console.error('[ALERTA][WEBHOOK] Fallo al notificar:', e.message);
    }
}

async function notificarAlertaCritica(mensaje) {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: `🚨 **ALERTA NELLY**: ${mensaje}`
        });
    } catch (e) {
        console.error('[ALERTA][WEBHOOK] Fallo al notificar:', e.message);
    }
}
// --- ENDPOINTS DE MONITOREO EXTERNO ---

// Recibe snapshot de métricas y reenvía a Discord
router.post('/monitoreo/discord', async (req, res) => {
    try {
        const { content } = req.body || {};
        if (!content || typeof content !== 'string') return res.status(400).json({ error: 'Falta contenido' });
        await notificarAlertaConexion(content);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Error enviando a Discord', detalle: e.message });
    }
});

// Recibe alerta manual desde el panel
router.post('/monitoreo/alerta', async (req, res) => {
    try {
        const { motivo } = req.body || {};
        if (!motivo || typeof motivo !== 'string') return res.status(400).json({ error: 'Falta motivo' });
        await notificarAlertaCritica(`[MANUAL] ${motivo}`);
        res.json({ ok: true });
    } catch (e) {
        res.status(500).json({ error: 'Error enviando alerta', detalle: e.message });
    }
});


module.exports = router;
