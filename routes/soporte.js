import express from 'express';
import { getAdmin } from '../config/firebase-admin-esm.js';
import { Parser } from 'json2csv';
const router = express.Router();

// Diagnóstico de tokens FCM de repartidores activos
router.get('/diagnostico-tokens', checkAccess, async (req, res) => {
    try {
        const admin = await getAdmin();
        // Leer ambos nodos: activos e inactivos
        const [activosSnap, inactivosSnap] = await Promise.all([
            admin.database().ref('conductores_activos').once('value'),
            admin.database().ref('repartidores').once('value')
        ]);
        const activos = activosSnap.val() || {};
        const inactivos = inactivosSnap.val() || {};
        const fcmRegex = /^[a-zA-Z0-9\-_:]{100,200}$/;
        const tokens = {};
        // Unificar IDs y marcar tipo
        const allIds = new Set([
            ...Object.keys(activos),
            ...Object.keys(inactivos)
        ]);
        const reporte = Array.from(allIds).map(id => {
            const infoActivo = activos[id] || {};
            const infoInactivo = inactivos[id] || {};
            // Prioridad: token de activos, si no existe usa el de inactivos
            const token = infoActivo.fcm_token || infoInactivo.fcm_token || '';
            const valido = !!token && fcmRegex.test(token);
            const duplicado = token && tokens[token];
            if (token) tokens[token] = (tokens[token] || 0) + 1;
            return {
                id,
                token,
                valido,
                duplicado,
                longitud: token.length,
                estado: infoActivo.fcm_token ? 'activo' : (infoInactivo.fcm_token ? 'inactivo' : 'sin_token')
            };
        });
        if (req.query.format === 'csv') {
            const parser = new Parser({ fields: ['id', 'token', 'valido', 'duplicado', 'longitud', 'estado'] });
            res.header('Content-Type', 'text/csv');
            res.attachment('diagnostico_tokens.csv');
            return res.send(parser.parse(reporte));
        }
        res.json({ total: reporte.length, reporte });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});
// Middleware de restricción por IP y token
const IP_WHITELIST = [
    '127.0.0.1', '::1', // Localhost
    // Agrega aquí IPs de soporte autorizadas
];
const ACCESS_TOKEN = process.env.SOPORTE_TOKEN || null;

function checkAccess(req, res, next) {
    const ip = req.ip || req.connection.remoteAddress;
    const token = req.query.token || req.body.token || req.headers['x-soporte-token'];
    if (!ACCESS_TOKEN && process.env.NODE_ENV === 'production') {
        return res.status(503).send('<h2>Soporte no configurado</h2><p>Falta SOPORTE_TOKEN.</p>');
    }
    if (!IP_WHITELIST.includes(ip) && token !== ACCESS_TOKEN) {
        return res.status(403).send('<h2>Acceso restringido</h2><p>Solo soporte autorizado.</p>');
    }
    next();
}

// Página de formulario protegida
router.get('/verificar-token', checkAccess, (req, res) => {
    res.send(`
        <h2>Verificar Token FCM de Repartidor</h2>
        <form method="POST" action="/soporte/verificar-token">
            <label>ID del repartidor:</label>
            <input name="idConductor" required>
            ${ACCESS_TOKEN ? `<input type="hidden" name="token" value="${ACCESS_TOKEN}">` : ''}
            <button type="submit">Consultar</button>
        </form>
    `);
});

// Procesa la consulta
router.post('/verificar-token', express.urlencoded({ extended: true }), checkAccess, async (req, res) => {
    // Permitir idConductor desde body o query para facilitar pruebas
    const idConductor = req.body.idConductor || req.query.idConductor;
    const logTime = new Date().toISOString();
    console.log(`[SOPORTE] Acceso a consulta de token FCM | id: ${idConductor} | ${logTime}`);
    try {
        const admin = await getAdmin();
        const snapshot = await admin.database()
            .ref(`conductores_activos/${idConductor}/fcm_token`)
            .once('value');
        const token = snapshot.val();

        // Validación de formato FCM (token típico: ~152 caracteres alfanuméricos)
        const fcmRegex = /^[a-zA-Z0-9\-_:]{100,200}$/;
        if (token && fcmRegex.test(token)) {
            res.send(`
                <h2>Token FCM para ${idConductor}</h2>
                <textarea rows="4" cols="80" readonly>${token}</textarea>
                <br><a href="/soporte/verificar-token">Consultar otro</a>
            `);
        } else if (token) {
            res.send(`
                <h2>Token encontrado pero formato inválido</h2>
                <textarea rows="4" cols="80" readonly>${token}</textarea>
                <p style="color:red">Advertencia: El token no cumple el formato esperado de FCM.</p>
                <br><a href="/soporte/verificar-token">Consultar otro</a>
            `);
        } else {
            res.send(`
                <h2>No se encontró token para ${idConductor}</h2>
                <a href="/soporte/verificar-token">Intentar de nuevo</a>
            `);
        }
    } catch (error) {
        res.send(`
            <h2>Error consultando RTDB</h2>
            <pre>${error.message}</pre>
            <a href="/soporte/verificar-token">Intentar de nuevo</a>
        `);
    }
});

export default router;
