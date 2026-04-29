import express from 'express';
const router = express.Router();

router.get('/', (req, res) => {
    res.status(200).json({ success: true, module: "Operativo" });
});

export default router;
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
