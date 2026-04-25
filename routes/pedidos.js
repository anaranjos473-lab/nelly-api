const express = require('express');
const router = express.Router();


let admin;
let alertaDiscord;
let listenerInicializado = false;

function init({ adminInstance, enviarAlertaDiscord }) {
    admin = adminInstance;
    alertaDiscord = enviarAlertaDiscord;
    if (!listenerInicializado && admin && alertaDiscord) {
        setupOrderAssignmentListener();
        listenerInicializado = true;
    }
}

// Listener granular para asignación de pedidos
function setupOrderAssignmentListener() {
    const db = admin.database();
    const ref = db.ref('pedidos_activos');
    ref.on('child_changed', async (snapshot, prevKey) => {
        try {
            const pedidoNuevo = snapshot.val() || {};
            const pedidoId = snapshot.key;
            // Obtener el valor anterior de repartidor_id
            // NOTA: RTDB no da el valor anterior directo, así que se requiere snapshot.previousChildName o mantener cache mínima si se quiere máxima precisión.
            // Aquí, para bajo impacto, solo notificamos si el campo repartidor_id existe y es válido.
            if (pedidoNuevo && pedidoNuevo.logistica && pedidoNuevo.logistica.repartidor_id) {
                // Usar un campo de control para evitar duplicados: solo alertar si no se ha alertado antes
                if (!pedidoNuevo._alerta_asignacion_enviada) {
                    await alertaDiscord(
                        '📦 Pedido asignado',
                        `Pedido ${pedidoId} asignado a repartidor ${pedidoNuevo.logistica.repartidor_id}`
                    );
                    // Marcar en RTDB que ya se notificó (campo efímero)
                    await snapshot.ref.update({ _alerta_asignacion_enviada: true });
                }
            }
        } catch (e) {
            console.error('[PEDIDOS][LISTENER][ASIGNACION] Error:', e.message);
        }
    });
}

// GET /api/pedidos/activos/:uid
// Devuelve los pedidos activos asignados a un repartidor en RTDB
router.get('/activos/:uid', async (req, res) => {
    const uid = req.params.uid;
    if (!uid) return res.status(400).json({ error: 'uid requerido' });
    try {
        const db = admin.database();
        const snap = await db.ref('pedidos_en_camino').orderByChild('repartidor').equalTo(uid).once('value');
        const pedidos = snap.val() || {};
        return res.json({ ok: true, pedidos });
    } catch (e) {
        return res.status(500).json({ error: 'Error consultando pedidos', detalle: e.message });
    }
});

// Aquí se pueden agregar endpoints POST para notificaciones instantáneas

module.exports = { router, init };
