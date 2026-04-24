
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
const express = require('express');
const router = express.Router();

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