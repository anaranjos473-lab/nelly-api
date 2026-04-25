const express = require('express');
const router = express.Router();

// Importar la lógica de niveles desde app.js (se pasará por parámetro)
let LIMITE_DEUDA_POR_NIVEL;
let admin;

function init({ limiteDeudaPorNivel, adminInstance }) {
    LIMITE_DEUDA_POR_NIVEL = limiteDeudaPorNivel;
    admin = adminInstance;
}


// GET /api/repartidor/status/:id (singular, camelCase)
router.get('/status/:id', async (req, res) => {
    const uid = req.params.id;
    if (!uid) return res.status(400).json({ error: 'uid requerido' });
    try {
        // Usar RTDB para consistencia con la app
        const ref = admin.database().ref(`repartidores/${uid}`);
        const snap = await ref.once('value');
        if (!snap.exists()) {
            return res.status(404).json({
                permitir: false,
                mensaje: 'Perfil de repartidor no encontrado',
                nivel: null,
                deudaActual: null,
                limiteDeuda: null
            });
        }
        const perfil = snap.val() || {};
        const nivel = perfil.nivel || (perfil.estatus && perfil.estatus.nivel) || 'BRONCE';
        const limiteDeuda = LIMITE_DEUDA_POR_NIVEL[nivel] || LIMITE_DEUDA_POR_NIVEL.BRONCE;
        const deudaActual = (perfil.finanzas && typeof perfil.finanzas.deuda_actual === 'number')
            ? perfil.finanzas.deuda_actual
            : (perfil.billetera && typeof perfil.billetera.deuda_comision === 'number' ? perfil.billetera.deuda_comision : 0);
        const bloqueadoPorDeuda = perfil.estatus?.bloqueado_por_deuda === true || perfil.perfil?.bloqueado_por_deuda === true || deudaActual > limiteDeuda;
        return res.json({
            permitir: !bloqueadoPorDeuda,
            nivel,
            deudaActual,
            limiteDeuda,
            saldoGanancias: perfil.finanzas?.saldo_ganancias || 0,
            bloqueadoPorDeuda,
            mensaje: bloqueadoPorDeuda
                ? 'Bloqueo por deuda aplicado automaticamente'
                : 'Repartidor habilitado para tomar pedidos'
        });
    } catch (e) {
        return res.status(500).json({ error: 'Error consultando estatus', detalle: e.message });
    }
});

module.exports = { router, init };
