// Endpoint raíz para monitorización
router.get('/', (req, res) => {
    res.status(200).json({
        success: true,
        message: "Módulo de repartidores operativo y a la espera de instrucciones"
    });
});

import express from 'express';
import admin from 'firebase-admin';
const router = express.Router();

// Lógica de niveles (puedes ajustar según tu app)
const LIMITE_DEUDA_POR_NIVEL = {
    BRONCE: 500,
    PLATA: 1000,
    ORO: 2000
};


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


// ...existing code...

export default router;


// POST /api/repartidores/cerrar-turno
router.post('/cerrar-turno', async (req, res) => {
    const { repartidorId, fcmToken } = req.body;

    if (!repartidorId) {
        return res.status(400).send({ error: "Falta repartidorId" });
    }

    try {
        // 1. Definir el rango de tiempo (Hoy)
        const inicioHoy = new Date();
        inicioHoy.setHours(0, 0, 0, 0);

        // 2. Consultar pedidos entregados por el repartidor hoy
        const pedidosRef = admin.firestore().collection('pedidos');
        const snapshot = await pedidosRef
            .where('repartidorId', '==', repartidorId)
            .where('estado', '==', 'Entregado')
            .where('timestampAsignacion', '>=', inicioHoy)
            .get();

        let totalKmAhorrados = 0;
        let conteoPedidos = 0;

        snapshot.forEach(doc => {
            const data = doc.data();
            totalKmAhorrados += (data.distanciaCalculada || 0);
            conteoPedidos++;
        });

        // 3. Preparar y enviar notificación FCM (Si el token existe)
        if (fcmToken && conteoPedidos > 0) {
            const payload = {
                notification: {
                    title: "¡Misión Cumplida, Pariente! 🏆",
                    body: `Hoy entregaste ${conteoPedidos} pedidos y ahorraste ${totalKmAhorrados.toFixed(2)}km de combustible. ¡Nelly Delivery te agradece!`
                },
                data: {
                    tipo: "RESUMEN_DIARIO",
                    km: totalKmAhorrados.toString()
                }
            };
            await admin.messaging().sendToDevice(fcmToken, payload);
        }

        // 4. Responder al cliente tras completar todo
        res.status(200).send({ 
            status: "Success",
            message: "Turno cerrado y métricas procesadas",
            conteo: conteoPedidos,
            ahorro: totalKmAhorrados.toFixed(2)
        });

    } catch (error) {
        console.error("Error en cierre de turno:", error);
        res.status(500).send({ error: "Error interno al procesar el cierre" });
    }
});
