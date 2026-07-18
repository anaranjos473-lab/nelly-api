require('dotenv').config();
// --- AGENTE DE INTEGRIDAD: CHECKLIST DE ARRANQUE ---
const verificarIntegridad = async () => {
    console.log('🔍 Agente: Iniciando chequeo de sistema...');
    // 1. Validar Webhook de Discord
    if (!process.env.DISCORD_WEBHOOK_URL) {
        console.warn('⚠️ Alerta: No hay Webhook de Discord. Las notificaciones estarán desactivadas.');
    }

    // 2. Validar Estructura de Firestore (Zonas y Pedidos)
    try {
        const zonasSnapshot = await db.collection('zonas').limit(1).get();
        if (zonasSnapshot.empty) {
            console.log('📦 Agente: Poblando zonas de Tuxtla Gutiérrez...');
            const zonasBase = ["Terán", "Centro", "Plaza del Sol", "Plan de Ayala"];
            for (const z of zonasBase) {
                await db.collection('zonas').add({ nombre: z, activa: true });
            }
        }
        console.log('✅ Agente: Base de datos vinculada y estructurada.');
    } catch (error) {
        console.error('❌ Error Crítico: No se pudo conectar con Firebase.', error.message);
        process.exit(1);
    }
};
require('dotenv').config();
const express = require('express');
const admin = require('firebase-admin');
const axios = require('axios');
const os = require('os');

const app = express();
app.use(express.json());

// Inicializar Firebase
const serviceAccount = require("./nelly-admin.json"); 
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}
const db = admin.firestore();
// --- ENDPOINT DE PRUEBA: SIMULACIÓN DE DEUDA CRÍTICA (83%) ---
app.get('/repartidor/status/:id', (req, res) => {
    // SIMULACIÓN DE RIESGO: 83% de deuda consumida
    res.json({
        id: req.params.id,
        nombre: "Beto (Test)",
        estatus: "ACTIVO",
        nivel: "DIAMANTE",
        deudaActual: 750, // <--- Esto disparará el semáforo
        limiteDeuda: 900,
        entregasHoy: 15
    });
});




const fs = require('fs');
const cors = require('cors');

app.use(cors());

const PORT = process.env.PORT || 10000;
const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

// --- DETECCIÓN DE IP (CORREGIDA) ---
function getLocalIp() {
    const interfaces = os.networkInterfaces();
    for (const name in interfaces) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) return iface.address;
        }
    }
    return '127.0.0.1';
}
const currentIp = getLocalIp();


// --- ALERTAS (CORREGIDAS) ---
const enviarAlertaDiscord = async (titulo, mensaje, color = 3447003) => {
    if (!DISCORD_WEBHOOK_URL) return;
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            embeds: [{
                title: titulo,
                description: mensaje,
                color: color,
                timestamp: new Date().toISOString()
            }]
        });
    } catch (e) {
        console.error(`❌ Error Discord: ${e.message}`);
    }
};

// --- NOTIFICADOR DE INICIO (VOZ DEL SERVIDOR) ---
const enviarNotificacionInicio = async (ip, puerto) => {
    const url = process.env.DISCORD_WEBHOOK_URL;
    if (!url) return;

    try {
        await axios.post(url, {
            embeds: [{
                title: "🚀 Nelly Delivery Online",
                description: `El servidor administrativo ha iniciado con éxito.`,
                color: 5814783, // Verde
                fields: [
                    { name: "📍 IP Local", value: `http://${ip}:${puerto}`, inline: true },
                    { name: "🔥 Firebase", value: "Conectado", inline: true }
                ],
                footer: { text: "Sistema de Monitoreo Nelly Sentinel" }
            }]
        });
        console.log('📢 Notificación enviada a Discord.');
    } catch (e) {
        console.error('❌ No se pudo enviar reporte a Discord.');
    }
};

// Exportar para que los módulos la usen
app.set('enviarAlertaDiscord', enviarAlertaDiscord);

// --- INTEGRIDAD Y FIREBASE ---

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DATABASE_URL
    });
}

// --- IMPORTACIÓN DE RUTAS MODULARES ---
const { router: repartidoresRouter, init: initRepartidores } = require('./routes/repartidores');
const { router: pedidosRouter, init: initPedidos } = require('./routes/pedidos');
initRepartidores({ limiteDeudaPorNivel: Object.freeze({ BRONCE: 300, PLATA: 500, ORO: 600, DIAMANTE: 900 }), adminInstance: admin });
initPedidos({ adminInstance: admin, enviarAlertaDiscord });
app.use('/api/repartidores', repartidoresRouter);
app.use('/api/pedidos', pedidosRouter);



// ARRANQUE INTELIGENTE UNIFICADO
const iniciarServidor = async () => {
    try {
        await verificarIntegridad(); // Chequeo de sistema y estructura

        app.listen(PORT, '0.0.0.0', () => {
            console.log('-------------------------------------------');
            console.log(`📡 Servidor Activo: http://${currentIp}:${PORT}`);
            console.log('-------------------------------------------');
            enviarNotificacionInicio(currentIp, PORT); // Notifica a Discord
        });
    } catch (error) {
        console.error('❌ Error crítico en el arranque:', error.message);
        process.exit(1);
    }
};

iniciarServidor();

process.on('uncaughtException', (err) => console.error(`🚨 Crash: ${err.message}`));
app.post('/api/pedidos', requireOrderApiKey, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const payload = req.body || {};
        const baseId = payload.id_pedido || payload.id || `test_${Date.now()}`;
        const pedidoId = String(baseId).trim();

        if (!pedidoId) {
            return res.status(400).json({ error: 'id_pedido es requerido' });
        }


        const nuevoPedido = {
            id: pedidoId,
            id_pedido: pedidoId,
            cliente_nombre: payload.cliente_nombre || payload.cliente || 'Cliente Anonimo',
            descripcion: payload.descripcion || payload.items || 'Sin descripcion',
            monto: Number(payload.monto || payload.total || 0),
            zonaNombre: payload.zonaNombre || 'Sin Zona',
            distanciaRecoleccion: typeof payload.distanciaRecoleccion === 'number' ? payload.distanciaRecoleccion : Number(payload.distanciaRecoleccion) || 0,
            estado: 'pendiente',
            timestamp: Date.now(),
            fecha_creacion: new Date().toISOString()
        };

        await db.ref(`pedidos/${pedidoId}`).set(nuevoPedido);
        console.log(`✅ Pedido inyectado con exito: ${pedidoId}`);

        return res.status(201).json({ mensaje: 'Pedido creado', data: nuevoPedido });
    } catch (error) {
        console.error('❌ Error en POST /api/pedidos:', error);
        return res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// --- RUTA 2.1: PEDIDO LISTO ---
const handlePedidoListo = async (req, res) => {
    if (!requireFirebase(res)) return;

    const { pedidoId, restauranteId, mensaje } = req.body;
    if (!pedidoId || !restauranteId) {
        return res.status(400).json({ error: 'pedidoId y restauranteId son requeridos' });
    }

    try {
        const pedidoRef = db.ref(`pedidos/${restauranteId}/${pedidoId}`);
        const snapshot = await pedidoRef.once('value');

        if (!snapshot.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        await pedidoRef.update({
            estado: 'Listo',
            mensaje_listo: mensaje || 'Pedido listo para entrega',
            fecha_listo: new Date().toISOString()
        });

        console.log(`✅ Pedido ${pedidoId} marcado como Listo en restaurante ${restauranteId}`);
        return res.json({ ok: true, pedidoId, restauranteId });
    } catch (error) {
        console.error('Error al marcar pedido listo:', error);
        return res.status(500).json({ error: 'Error al procesar pedido listo' });
    }
};

app.post('/api/pedidos/listo', handlePedidoListo);
app.post('/pedido-listo', handlePedidoListo);

// --- RUTA 2.2: ENVIAR NOTIFICACIÓN FCM DE PEDIDO LISTO ---
app.post('/api/pedidos/notificar-listo', async (req, res) => {
    if (!requireFirebase(res)) return;

    const { deviceToken, pedidoId, restauranteId } = req.body;
    if (!deviceToken || !pedidoId || !restauranteId) {
        return res.status(400).json({ error: 'deviceToken, pedidoId y restauranteId son requeridos' });
    }

    try {
        const message = {
            token: deviceToken,
            notification: {
                title: 'Pedido listo',
                body: `Tu pedido #${pedidoId} ya está listo para entrega`
            },
            data: {
                pedidoId,
                restauranteId,
                estado: 'Listo',
                mensaje: 'Pedido listo para entrega'
            }
        };

        // Añadir channelId para Android
        message.android = {
            notification: {
                channelId: 'alertas_criticas'
            }
        };

        await admin.messaging().send(message);
        console.log(`🔔 Notificación FCM enviada para pedido ${pedidoId} (con channelId 'alertas_criticas')`);
        return res.json({ ok: true, pedidoId });
    } catch (error) {
        console.error('Error enviando notificación FCM:', error);
        return res.status(500).json({ error: 'No se pudo enviar la notificación' });
    }
});

// --- RUTA 3: GENERAR PAGO ---
app.post('/pago/generar', async (req, res) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: req.body.titulo || 'Pedido Nelly', quantity: 1, unit_price: Number(req.body.precio) || 150, currency_id: "MXN" }],
        notification_url: `${URL_DE_TU_API}/webhook`, 
        back_urls: { success: `${URL_DE_TU_API}/success` },
        auto_return: "approved",
      }
    });
    res.json({ link: result.init_point }); 
  } catch (error) { res.status(500).json({ error: "Error pago", detalle: error.message }); }
});

// --- RUTA 4: EL WEBHOOK (Con Resend y Notificaciones) ---
app.post('/webhook', async (req, res) => {
    const { type, data } = req.body;
    if (type !== 'payment') return res.sendStatus(200);
    if (!requireFirebase(res)) return;

    try {
        const payment = new Payment(client);
        const infoPago = await payment.get({ id: data.id });
        
        if (infoPago.status === 'approved') {
            const monto = infoPago.transaction_amount;
            const emailCliente = infoPago.payer?.email || 'cliente@ejemplo.com';
            console.log(`💰 PAGO APROBADO: $${monto} de ${emailCliente}`);

            // 1. Registro en Firebase
            try {
                await admin.database().ref(`pagos_confirmados/${data.id}`).set({
                    monto: monto,
                    email: emailCliente,
                    fecha: new Date().toISOString(),
                    status: 'approved'
                });
            } catch (e) { console.error("Error en DB:", e.message); }

            // 2. Enviar Correo con Resend
            try {
                await resend.emails.send({
                    from: 'Nelly Delivery <onboarding@resend.dev>',
                    to: emailCliente,
                    subject: '¡Tu pedido en Nelly está en camino! 🛵',
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                            <h2 style="color: #2ecc71;">¡Gracias por tu compra!</h2>
                            <p>Hemos recibido tu pago de <strong>$${monto} MXN</strong>.</p>
                            <p><strong>Folio:</strong> #${data.id}</p>
                            <p>Nelly ya está coordinando con el repartidor. ¡Buen provecho!</p>
                        </div>
                    `
                });
                console.log("📧 Correo enviado a:", emailCliente);
            } catch (mailError) { console.error("❌ Error correo:", mailError.message); }

            // 3. Notificar al repartidor
                if (!firebaseAdminInitialized) {
                console.warn('⚠️ Firebase Admin no inicializado, no se enviará notificación al repartidor.');
            } else {
                const snapshot = await db.ref(`repartidores/driver_123/fcm_token`).once('value');
                const fcmToken = snapshot.val();

                if (fcmToken) {
                    const mensaje = {
                        notification: { title: '¡PAGO RECIBIDO! 🤑', body: `Nuevo pedido por $${monto}. ¡A rodar!` },
                        android: {
                            notification: {
                                channelId: 'alertas_criticas'
                            }
                        },
                        token: fcmToken
                    };
                    await admin.messaging().send(mensaje);
                    console.log("🔔 Notificación enviada (con channelId 'alertas_criticas')");
                }
            }
        }
        res.sendStatus(200); 
    } catch (error) {
        console.error("❌ Error en webhook:", error.message);
        res.sendStatus(500);
    }
});

// --- ENDPOINT: ACTUALIZACION DE UBICACION GPS ---
app.post('/api/delivery/update-location', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const { lat, lng, pedidoId } = req.body;
    const uid = req.user.uid;
    const updatedAt = Date.now();

    if (
        typeof lat !== 'number' ||
        lat < -90 ||
        lat > 90 ||
        typeof lng !== 'number' ||
        lng < -180 ||
        lng > 180
    ) {
        return res.status(400).json({ error: 'Coordenadas invalidas' });
    }

    try {
        const updates = {};
        updates[`repartidores/${uid}/currentLocation`] = { lat, lng, updatedAt };

        if (pedidoId) {
            updates[`pedidos_en_camino/${pedidoId}/driverLocation`] = {
                lat,
                lng,
                driverUid: uid,
                updatedAt
            };
        }

        await db.ref().update(updates);
        return res.status(200).json({ status: 'Location updated' });
    } catch (error) {
        console.error('[DB ERROR Location]:', error.message);
        return res.status(500).json({ error: 'Error al escribir en base de datos' });
    }
});

// --- ENDPOINT: REGISTRAR COBRO EN EFECTIVO (TX ATOMICA + BLOQUEO REALTIME) ---
app.post('/api/delivery/finanzas/registrar-cobro-efectivo', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = req.user.uid;
    const montoEfectivo = Number(req.body?.monto_efectivo);
    const pedidoId = String(req.body?.pedidoId || '').trim() || null;

    if (!Number.isFinite(montoEfectivo) || montoEfectivo <= 0) {
        return res.status(400).json({ error: 'monto_efectivo debe ser un numero mayor a cero' });
    }

    try {
        const finanzas = await registrarCobroEfectivoTx(db, {
            uid,
            montoEfectivo,
            pedidoId,
            origen: 'driver_app',
        });

        return res.status(200).json({
            ok: true,
            uid,
            nivel: finanzas.nivel,
            deudaActual: finanzas.deudaActual,
            limiteDeuda: finanzas.limiteDeuda,
            saldoGanancias: finanzas.saldoGanancias,
            bloqueadoPorDeuda: finanzas.bloqueadoPorDeuda,
            mensaje: finanzas.bloqueadoPorDeuda
                ? 'Bloqueo por deuda aplicado automaticamente'
                : 'Cobro registrado correctamente',
        });
    } catch (error) {
        console.error('[FINANZAS][COBRO_EFECTIVO] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo registrar el cobro en efectivo' });
    }
});

// --- ENDPOINT: REGISTRAR LIQUIDACION/PAGO DE DEUDA (TX ATOMICA) ---
app.post('/api/panel/finanzas/registrar-pago-deuda', requirePanelSessionAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = String(req.body?.uid || '').trim();
    const montoPago = Number(req.body?.monto_pago);

    if (!uid) {
        return res.status(400).json({ error: 'uid es requerido' });
    }

    if (!Number.isFinite(montoPago) || montoPago <= 0) {
        return res.status(400).json({ error: 'monto_pago debe ser un numero mayor a cero' });
    }

    try {
        const finanzas = await registrarPagoDeudaTx(db, {
            uid,
            montoPago,
            origen: 'panel_cocina',
        });

        return res.status(200).json({
            ok: true,
            uid,
            nivel: finanzas.nivel,
            deudaActual: finanzas.deudaActual,
            limiteDeuda: finanzas.limiteDeuda,
            saldoGanancias: finanzas.saldoGanancias,
            bloqueadoPorDeuda: finanzas.bloqueadoPorDeuda,
            mensaje: finanzas.bloqueadoPorDeuda
                ? 'Pago aplicado, pero el repartidor sigue bloqueado por deuda'
                : 'Pago aplicado y repartidor habilitado para nuevos pedidos',
        });
    } catch (error) {
        console.error('[FINANZAS][PAGO_DEUDA] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo registrar el pago de deuda' });
    }
});

// --- ENDPOINT: BLOQUEO MANUAL DE REPARTIDOR (PANEL ADMIN WEB) ---
app.get('/api/admin/repartidores', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const [usuariosSnap, repartidoresSnap] = await Promise.all([
            db.ref('usuarios/repartidores').once('value'),
            db.ref('repartidores').once('value'),
        ]);

        const usuarios = usuariosSnap.val();
        const repartidores = repartidoresSnap.val();
        const source = usuarios && typeof usuarios === 'object' && Object.keys(usuarios).length > 0
            ? 'usuarios/repartidores'
            : 'repartidores';
        const drivers = source === 'usuarios/repartidores'
            ? (usuarios || {})
            : (repartidores || {});

        return res.status(200).json({
            ok: true,
            source,
            drivers,
        });
    } catch (error) {
        console.error('[ADMIN][DRIVERS_LIST] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo obtener la lista de repartidores' });
    }
});

app.get('/api/admin/pedidos/metricas', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const snapshot = await db.ref('pedidos_activos').once('value');
        const orders = snapshot.val() || {};

        return res.status(200).json({
            ok: true,
            activos: Object.keys(orders).length,
        });
    } catch (error) {
        console.error('[ADMIN][ORDERS_METRICS] Error:', error.message);
        return res.status(500).json({ error: 'No se pudieron obtener las metricas de pedidos' });
    }
});

app.post('/api/admin/repartidores/manual-lock', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const uid = String(req.body?.uid || '').trim();
    const bloqueado = req.body?.bloqueado === true;

    if (!uid) {
        return res.status(400).json({ error: 'uid es requerido' });
    }

    try {
        const now = Date.now();
        const updates = {};
        updates[`repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`repartidores/${uid}/estatus/updated_at`] = now;
        updates[`repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        updates[`usuarios/repartidores/${uid}/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueado_por_deuda`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/bloqueo_manual`] = bloqueado;
        updates[`usuarios/repartidores/${uid}/estatus/updated_at`] = now;
        updates[`usuarios/repartidores/${uid}/perfil/bloqueado_por_deuda`] = bloqueado;

        await db.ref().update(updates);

        return res.status(200).json({ ok: true, uid, bloqueado });
    } catch (error) {
        console.error('[ADMIN][MANUAL_LOCK] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo actualizar bloqueo manual' });
    }
});


// --- MÓDULO DE INTELIGENCIA FINANCIERA NELLY ---
app.get('/api/admin/metricas/rentabilidad', requirePanelAdminEmailAuth, async (req, res) => {
    try {
        const db = admin.database();

        const [
            finanzasSnap,
            historialSnap
        ] = await Promise.all([
            db.ref('finanzas').once('value'),
            db.ref('historial_ventas').once('value')
        ]);

        const finanzas = finanzasSnap.val() || {};
        const historial = historialSnap.val() || {};

        const ventasBrutas = Number(finanzas.ingresosHoy || 0);

        const conteoEntregas = Object.keys(historial).length;

        const metrics = {
            ventasBrutas,
            comisionesNelly: +(ventasBrutas * 0.15).toFixed(2),
            conteoEntregas,
            mapaCalor: {}
        };

        console.log(
            `[FINANZAS] 💰 Corte de caja generado: $${metrics.ventasBrutas} brutos.`
        );

        return res.status(200).json(metrics);

    } catch (error) {
        console.error("🔥 Error en Dashboard Financiero:", error);
        return res.status(500).json({ error: "No se pudo calcular la rentabilidad" });
    }
});

// --- ENDPOINT: CREACION MANUAL DE PEDIDO (PANEL ADMIN WEB) ---
app.post('/api/admin/pedidos/manual', requirePanelAdminEmailAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const clienteNombre = String(req.body?.cliente_nombre || '').trim();
    const telefono = String(req.body?.telefono || '').trim();
    const direccion = String(req.body?.direccion || '').trim();
    const descripcion = String(req.body?.descripcion || 'Pedido telefonico').trim();
    const repartidorId = String(req.body?.repartidor_id || '').trim() || null;
    const monto = Number(req.body?.monto || 0);

    if (!clienteNombre || !telefono || !direccion) {
        return res.status(400).json({ error: 'cliente_nombre, telefono y direccion son requeridos' });
    }

    if (!Number.isFinite(monto) || monto <= 0) {
        return res.status(400).json({ error: 'monto debe ser un numero mayor a cero' });
    }

    try {
        const pedidoRef = db.ref('pedidos_activos').push();
        const now = Date.now();
        const payload = {
            id_pedido: pedidoRef.key,
            cliente_nombre: clienteNombre,
            telefono,
            direccion,
            monto: Number(monto.toFixed(2)),
            descripcion,
            origen: 'panel_admin',
            created_at: now,
            logistica: {
                estado: repartidorId ? 'en_reparto' : 'pendiente',
                repartidor_id: repartidorId,
                manual: true,
            },
        };

        await pedidoRef.set(payload);
        return res.status(201).json({ ok: true, pedidoId: pedidoRef.key, pedido: payload });
    } catch (error) {
        console.error('[ADMIN][PEDIDO_MANUAL] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo crear el pedido manual' });
    }
});

// --- ENDPOINT: ACEPTAR PEDIDO (SERVER-AUTHORITATIVE) ---
app.post('/api/delivery/accept-order', requireDriverAuth, async (req, res) => {
    if (!requireFirebase(res)) return;

    const pedidoId = String(req.body?.pedidoId || '').trim();
    const uid = req.user.uid;

    if (!pedidoId) {
        return res.status(400).json({ error: 'pedidoId es requerido' });
    }

    try {
        const capacidad = await verificarCapacidadReparto(uid);
        if (!capacidad.permitir) {
            return res.status(403).json({
                error: capacidad.mensaje,
                nivel: capacidad.nivel,
                deudaActual: capacidad.deudaActual,
                limite: capacidad.limite
            });
        }

        const pedidoRef = db.ref(`pedidos_para_reparto/${pedidoId}`);
        const acceptedAt = Date.now();

        const tx = await pedidoRef.transaction((actual) => {
            if (!actual || typeof actual !== 'object') {
                return;
            }

            const logistica = actual.logistica && typeof actual.logistica === 'object'
                ? actual.logistica
                : {};

            const estado = String(logistica.estado || actual.estado || '').trim().toLowerCase();
            const repartidorActual = String(logistica.repartidor_id || actual.repartidor || '').trim();
            const disponible = !repartidorActual
                || repartidorActual === uid
                || estado === ''
                || estado === 'disponible'
                || estado === 'esperando_repartidor'
                || estado === 'listo'
                || estado === 'listo_para_reparto';

            if (!disponible) {
                return;
            }

            return {
                ...actual,
                estado: 'en_camino',
                repartidor: uid,
                aceptado_en: acceptedAt,
                logistica: {
                    ...logistica,
                    estado: 'tomado',
                    repartidor_id: uid,
                    tomado_en: acceptedAt
                }
            };
        });

        if (!tx.committed || !tx.snapshot.exists()) {
            return res.status(409).json({ error: 'El pedido ya fue tomado por otro repartidor' });
        }

        const pedidoTomado = tx.snapshot.val() || {};
        const updates = {};
        updates[`pedidos/${pedidoId}/estado`] = 'en_reparto';
        updates[`pedidos/${pedidoId}/repartidor_asignado`] = uid;
        updates[`pedidos_en_camino/${pedidoId}`] = pedidoTomado;

        await db.ref().update(updates);

        return res.json({
            ok: true,
            pedidoId,
            estado: 'en_reparto',
            repartidorUid: uid
        });
    } catch (error) {
        console.error('[DELIVERY][ACCEPT_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo aceptar pedido' });
    }
});

// --- ENDPOINT: COMPLETAR PEDIDO (SERVER-AUTHORITATIVE PANEL) ---
app.post('/api/delivery/complete-order', async (req, res) => {
    if (!requireFirebase(res)) return;

    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    let decodedToken;
    try {
        decodedToken = await admin.auth().verifyIdToken(idToken);
    } catch (error) {
        console.error('[AUTH ERROR CompleteOrder]:', error.message);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }

    const esPanel = decodedToken.admin === true || decodedToken.role === 'panel_cocina' || decodedToken.panel === true;
    const esDriver = decodedToken.driver === true || decodedToken.role === 'repartidor';
    if (!esPanel && !esDriver) {
        return res.status(403).json({ error: 'Acceso denegado: sesion invalida para completar pedido' });
    }

    const orderId = String(req.body?.orderId || req.body?.pedidoId || '').trim();
    if (!orderId) {
        return res.status(400).json({ error: 'orderId es requerido' });
    }

    try {
        const pedidoRef = db.ref(`pedidos/${orderId}`);
        const pedidoSnap = await pedidoRef.once('value');
        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido no encontrado' });
        }

        const pedidoActual = pedidoSnap.val() || {};
        const estadoActual = String(pedidoActual.estado || '').trim().toLowerCase();
        const puedeFinalizar =
            estadoActual === 'en_reparto' ||
            estadoActual === 'en_camino' ||
            estadoActual === 'reparto' ||
            estadoActual === 'llegue_a_cliente' ||
            estadoActual === 'llegue_al_cliente' ||
            estadoActual === 'punto_de_entrega';
        if (!puedeFinalizar) {
            return res.status(409).json({
                error: 'Transicion invalida: el pedido aun no esta en reparto',
                estadoActual
            });
        }

        const now = Date.now();
        const updates = {};
        updates[`pedidos/${orderId}/estado`] = 'entregado';
        updates[`pedidos/${orderId}/fecha_finalizado`] = now;
        updates[`pedidos_en_camino/${orderId}/estado`] = 'entregado';
        updates[`pedidos_en_camino/${orderId}/entregado_en`] = now;
        updates[`pedidos_para_reparto/${orderId}`] = null;

        await db.ref().update(updates);

        return res.json({
            ok: true,
            orderId,
            estado: 'entregado',
            finalizedAt: now
        });
    } catch (error) {
        console.error('[DELIVERY][COMPLETE_ORDER] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo completar pedido' });
    }
});

// --- ENDPOINT: ETA CON TRAFICO REAL (DISTANCE MATRIX) ---
app.post('/api/delivery/eta', etaLimiter, async (req, res) => {
    const {
        originLat,
        originLng,
        destinationLat,
        destinationLng
    } = req.body || {};

    const oLat = Number(originLat);
    const oLng = Number(originLng);
    const dLat = Number(destinationLat);
    const dLng = Number(destinationLng);

    if (!esCoordenadaValida(oLat, oLng) || !esCoordenadaValida(dLat, dLng)) {
        return res.status(400).json({ error: 'Coordenadas invalidas para calcular ETA' });
    }

    const googleMapsApiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY || process.env.GOOGLE_MAPS_API_KEY;
    if (!googleMapsApiKey) {
        return res.status(503).json({ error: 'GOOGLE_DISTANCE_MATRIX_API_KEY no configurada' });
    }

    try {
        const response = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
            params: {
                origins: `${oLat},${oLng}`,
                destinations: `${dLat},${dLng}`,
                departure_time: 'now',
                traffic_model: 'best_guess',
                mode: 'driving',
                language: 'es-MX',
                units: 'metric',
                key: googleMapsApiKey
            },
            timeout: 10000
        });

        const payload = response.data;
        if (payload?.status !== 'OK') {
            console.error('[ETA ERROR] Google status:', payload?.status);
            return res.status(502).json({ error: 'Google Distance Matrix no disponible', providerStatus: payload?.status || 'UNKNOWN' });
        }

        const element = payload.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            return res.status(422).json({ error: 'No se pudo calcular ruta para este pedido', providerElementStatus: element?.status || 'UNKNOWN' });
        }

        const distanceMeters = Number(element.distance?.value || 0);
        const durationSec = Number(element.duration?.value || 0);
        const durationInTrafficSec = Number(element.duration_in_traffic?.value || durationSec);
        const etaSeconds = Math.max(0, durationInTrafficSec);
        const etaMinutes = Math.ceil(etaSeconds / 60);
        const arrivesAtMs = Date.now() + etaSeconds * 1000;

        return res.json({
            ok: true,
            distanceMeters,
            distanceText: element.distance?.text || `${(distanceMeters / 1000).toFixed(1)} km`,
            durationSec,
            durationInTrafficSec,
            etaSeconds,
            etaMinutes,
            etaText: `${etaMinutes} min`,
            arrivesAtMs
        });
    } catch (error) {
        console.error('[ETA ERROR] Fallo consultando Distance Matrix:', error.message);
        return res.status(500).json({ error: 'Error calculando ETA', detail: error.message });
    }
});

// --- ENDPOINT: ETA LOGISTICO PARA EN_CAMINO ---
app.post('/api/logistics/eta', requireDriverAuth, etaLimiter, async (req, res) => {
    if (!requireFirebase(res)) return;

    const { origin, destination, pedidoId } = req.body || {};
    if (!pedidoId || typeof pedidoId !== 'string') {
        return res.status(400).json({ error: 'pedidoId es requerido' });
    }

    const originCoords = parseCoordInput(origin);
    const destinationCoords = parseCoordInput(destination);
    if (!originCoords || !destinationCoords) {
        return res.status(400).json({ error: 'origin y destination deben ser coordenadas validas (lat,lng)' });
    }

    const mapsApiKey = process.env.GOOGLE_DISTANCE_MATRIX_API_KEY
        || process.env.GOOGLE_MAPS_API_KEY
        || process.env.MAPS_API_KEY;

    if (!mapsApiKey) {
        return res.status(503).json({ error: 'MAPS API key no configurada' });
    }

    try {
        const pedidoRef = db.ref(`pedidos_en_camino/${pedidoId}`);
        const pedidoSnap = await pedidoRef.once('value');

        if (!pedidoSnap.exists()) {
            return res.status(404).json({ error: 'Pedido EN_CAMINO no encontrado' });
        }

        const pedido = pedidoSnap.val() || {};
        const estado = String(pedido.estado || '').toLowerCase();
        if (estado && estado !== 'en_camino') {
            return res.status(409).json({ error: 'El pedido no esta en estado EN_CAMINO' });
        }

        const pedidoDriverUid = pedido.driverLocation?.driverUid || pedido.repartidor;
        if (pedidoDriverUid && pedidoDriverUid !== req.user.uid) {
            return res.status(403).json({ error: 'No autorizado para actualizar ETA de este pedido' });
        }

        const prevEta = pedido.eta;
        const prevOrigin = prevEta?.origin;
        if (prevEta && prevOrigin && esCoordenadaValida(Number(prevOrigin.lat), Number(prevOrigin.lng))) {
            const movedMeters = distanciaMetrosHaversine(
                Number(prevOrigin.lat),
                Number(prevOrigin.lng),
                originCoords.lat,
                originCoords.lng
            );

            if (movedMeters < 50) {
                return res.json({
                    ...prevEta,
                    cached: true,
                    movedMeters: Math.round(movedMeters)
                });
            }
        }

        const dmResponse = await googleMapsClient.distancematrix({
            params: {
                origins: [`${originCoords.lat},${originCoords.lng}`],
                destinations: [`${destinationCoords.lat},${destinationCoords.lng}`],
                mode: 'driving',
                departure_time: 'now',
                traffic_model: 'best_guess',
                language: 'es-MX',
                units: 'metric',
                key: mapsApiKey
            },
            timeout: 10000
        });

        const element = dmResponse?.data?.rows?.[0]?.elements?.[0];
        if (!element || element.status !== 'OK') {
            return res.status(422).json({
                error: 'No se pudo calcular ETA para esta ruta',
                providerElementStatus: element?.status || 'UNKNOWN'
            });
        }

        const etaData = {
            durationText: element.duration_in_traffic?.text || element.duration?.text || '--',
            durationValue: Number(element.duration_in_traffic?.value || element.duration?.value || 0),
            distanceText: element.distance?.text || '--',
            distanceValue: Number(element.distance?.value || 0),
            origin: originCoords,
            destination: destinationCoords,
            updatedAt: Date.now()
        };

        await db.ref(`pedidos_en_camino/${pedidoId}/eta`).set(etaData);
        return res.json({ ...etaData, cached: false });
    } catch (e) {
        console.error('[ETA ERROR]:', e.message);
        return res.status(500).json({ error: 'No se pudo calcular el tiempo' });
    }
});

// --- ENDPOINT: LIQUIDACIONES DE BILLETERA (NELLY ECONOMICS) ---
app.post('/api/liquidaciones', async (req, res) => {
    if (!requireFirebase(res)) return;

    const {
        action,
        liquidacionId,
        monto,
        evidencia,
        observaciones,
        repartidorUid,
        aprobadoPor,
        rechazadoPor,
        motivo
    } = req.body || {};

    const accion = String(action || 'reportar').trim().toLowerCase();
    const idNormalizado = String(liquidacionId || '').trim();

    if (accion === 'reportar') {
        const authHeader = req.headers.authorization || '';
        const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
        if (!idToken) {
            return res.status(401).json({ error: 'No se proporciono token' });
        }

        try {
            const decodedToken = await admin.auth().verifyIdToken(idToken);
            if (!(decodedToken.driver === true || decodedToken.role === 'repartidor')) {
                return res.status(403).json({ error: 'Acceso denegado: No es un perfil de repartidor' });
            }

            const uid = repartidorUid || decodedToken.uid;
            const nuevoId = idNormalizado || `liq_${Date.now()}`;
            const montoNumero = Number(monto || 0);
            if (!Number.isFinite(montoNumero) || montoNumero <= 0) {
                return res.status(400).json({ error: 'monto debe ser numerico y mayor a 0' });
            }

            const payload = {
                id: nuevoId,
                repartidorUid: uid,
                monto: Number(montoNumero.toFixed(2)),
                evidencia: evidencia || null,
                observaciones: observaciones || '',
                estado: 'PENDIENTE',
                versionSistema: ECOSYSTEM_VERSION,
                creadoEn: Date.now(),
                actualizadoEn: Date.now()
            };

            const updates = {};
            updates[`liquidaciones/${nuevoId}`] = payload;
            updates[`liquidaciones_auditoria/${nuevoId}_${Date.now()}`] = {
                liquidacionId: nuevoId,
                estado: 'PENDIENTE',
                evento: 'LIQUIDACION_REPORTADA',
                repartidorUid: uid,
                monto: payload.monto,
                versionSistema: ECOSYSTEM_VERSION,
                timestamp: Date.now()
            };

            await db.ref().update(updates);
            return res.status(201).json({ ok: true, liquidacion: payload });
        } catch (error) {
            console.error('[LIQUIDACION][REPORTAR] Error:', error.message);
            return res.status(401).json({ error: 'Token invalido o expirado' });
        }
    }

    if (accion !== 'autorizar' && accion !== 'rechazar') {
        return res.status(400).json({ error: 'action debe ser reportar, autorizar o rechazar' });
    }

    return requirePanelApiKey(req, res, async () => {
        if (!idNormalizado) {
            return res.status(400).json({ error: 'liquidacionId es requerido para autorizar/rechazar' });
        }

        try {
            const liqRef = db.ref(`liquidaciones/${idNormalizado}`);
            const snap = await liqRef.once('value');
            if (!snap.exists()) {
                return res.status(404).json({ error: 'Liquidacion no encontrada' });
            }

            const actual = snap.val() || {};
            if (String(actual.estado || '').toUpperCase() !== 'PENDIENTE') {
                return res.status(409).json({ error: 'La liquidacion ya fue resuelta' });
            }

            const nuevoEstado = accion === 'autorizar' ? 'AUTORIZADA' : 'RECHAZADA';
            const actualizacion = {
                estado: nuevoEstado,
                actualizadoEn: Date.now(),
                versionSistema: ECOSYSTEM_VERSION,
                motivo: motivo || actual.motivo || null
            };

            if (accion === 'autorizar') {
                actualizacion.aprobadoPor = aprobadoPor || 'panel_cocina';
            } else {
                actualizacion.rechazadoPor = rechazadoPor || 'panel_cocina';
            }

            await liqRef.update(actualizacion);
            await db.ref(`liquidaciones_auditoria/${idNormalizado}_${Date.now()}`).set({
                liquidacionId: idNormalizado,
                estado: nuevoEstado,
                evento: accion === 'autorizar' ? 'LIQUIDACION_AUTORIZADA' : 'LIQUIDACION_RECHAZADA',
                repartidorUid: actual.repartidorUid || null,
                monto: Number(actual.monto || 0),
                aprobadoPor: actualizacion.aprobadoPor || null,
                rechazadoPor: actualizacion.rechazadoPor || null,
                motivo: actualizacion.motivo,
                versionSistema: ECOSYSTEM_VERSION,
                timestamp: Date.now()
            });

            return res.json({
                ok: true,
                liquidacionId: idNormalizado,
                estado: nuevoEstado
            });
        } catch (error) {
            console.error('[LIQUIDACION][RESOLVER] Error:', error.message);
            return res.status(500).json({ error: 'No se pudo resolver la liquidacion' });
        }
    });
});

app.get('/api/liquidaciones', requirePanelApiKey, async (req, res) => {
    if (!requireFirebase(res)) return;

    try {
        const estadoFiltro = String(req.query.estado || '').trim().toUpperCase();
        const snap = await db.ref('liquidaciones').once('value');
        const raiz = snap.val() || {};
        const items = Object.values(raiz)
            .filter((item) => item && typeof item === 'object')
            .filter((item) => !estadoFiltro || String(item.estado || '').toUpperCase() === estadoFiltro)
            .sort((a, b) => Number(b.actualizadoEn || 0) - Number(a.actualizadoEn || 0));

        return res.json({ ok: true, total: items.length, items });
    } catch (error) {
        console.error('[LIQUIDACION][LISTA] Error:', error.message);
        return res.status(500).json({ error: 'No se pudo listar liquidaciones' });
    }
});

// --- CONTROLADOR: TOKEN SEGURO PARA PANEL DE COCINA ---
const panelTokenController = async (req, res) => {
    const origin = req.headers.origin || '';
    const normalizedOrigin = normalizeOrigin(origin);
    if (normalizedOrigin !== PANEL_ALLOWED_ORIGIN) {
        console.warn(`[AUTH BLOCK] Origen no autorizado: ${origin || 'sin-origin'}`);
        return res.status(403).json({ error: 'Origen no autorizado' });
    }

    const forwardedFor = req.headers['x-forwarded-for'];
    const ip = Array.isArray(forwardedFor)
        ? forwardedFor[0]
        : (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : req.socket.remoteAddress);

    if (!firebaseAdminInitialized) {
        console.error(`[ERROR AUTH] Firebase Admin no inicializado para IP ${ip}`);
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const uid = 'panel-cocina-nelly';
        const additionalClaims = {
            admin: true,
            role: 'panel_cocina'
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        console.log(`[AUTH] Token generado exitosamente para IP: ${ip} a las ${new Date().toISOString()}`);
        return res.json({ token: customToken });
    } catch (error) {
        console.error(`[ERROR AUTH] Fallo al generar token para IP ${ip}:`, error.message);
        return res.status(500).json({ error: 'Error interno de seguridad' });
    }
};

// --- CONTROLADOR: TOKEN PARA MODULO WEB DE REPARTIDOR ---
const driverTokenController = async (req, res) => {
    const origin = req.headers.origin || '';
    const normalizedOrigin = normalizeOrigin(origin);
    if (normalizedOrigin !== PANEL_ALLOWED_ORIGIN) {
        console.warn(`[AUTH BLOCK][DRIVER] Origen no autorizado: ${origin || 'sin-origin'}`);
        return res.status(403).json({ error: 'Origen no autorizado' });
    }

    const uid = String(req.query.uid || '').trim();
    if (!uid || !/^[A-Za-z0-9_-]{4,128}$/.test(uid)) {
        return res.status(400).json({ error: 'uid de repartidor invalido' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const repartidorSnap = await db.ref(`repartidores/${uid}`).once('value');
        if (!repartidorSnap.exists()) {
            return res.status(404).json({ error: 'Repartidor no registrado' });
        }

        const repartidor = repartidorSnap.val() || {};
        if (repartidor.activo === false) {
            return res.status(403).json({ error: 'Repartidor inactivo' });
        }

        const additionalClaims = {
            driver: true,
            role: 'repartidor'
        };

        const customToken = await admin.auth().createCustomToken(uid, additionalClaims);
        return res.json({ token: customToken, uid });
    } catch (error) {
        console.error('[ERROR AUTH][DRIVER TOKEN]:', error.message);
        return res.status(500).json({ error: 'No se pudo generar token de repartidor' });
    }
};

// --- CONTROLADOR: HEALTHCHECK (para Keep-Alive en Render) ---
const healthcheckController = (req, res) => {
    return res.status(200).json({
        status: 'ok',
        service: 'nelly-api',
        versionSistema: ECOSYSTEM_VERSION,
        timestamp: new Date().toISOString(),
    });
};



// --- API ROUTER MODULAR ---
const apiRouter = express.Router();

// --- Memoria de logs utilitarios (en memoria RAM, reinicio = limpia) ---
const logsUtilitarios = [];
function registrarLogHelper(tipo, mensaje, extra = {}) {
    logsUtilitarios.push({
        timestamp: new Date().toISOString(),
        tipo,
        mensaje,
        ...extra
    });
    if (logsUtilitarios.length > 20) logsUtilitarios.shift();
}

// 1. Healthcheck básico
apiRouter.get('/health', (req, res) => {
    res.json({ status: "Online", agente: "Activo", database: "Firestore OK" });
});

// 2. Estado de Firebase
apiRouter.get('/debug/firebase', async (req, res) => {
    try {
        const collections = await db.listCollections();
        registrarLogHelper('info', 'Consulta de estado Firebase', { colecciones: collections.map(c => c.id) });
        res.json({ connected: true, collections: collections.map(c => c.id) });
    } catch (e) {
        registrarLogHelper('error', 'Fallo consulta Firebase', { error: e.message });
        res.status(500).json({ connected: false, error: e.message });
    }
});

// 3. Últimos logs de operaciones
apiRouter.get('/debug/logs', (req, res) => {
    res.json({ logs: logsUtilitarios.slice(-5).reverse() });
});


// 4. Limpiar pedidos de prueba
apiRouter.post('/debug/reset-pedidos', async (req, res) => {
    try {
        // Buscar y eliminar pedidos de prueba (marcados como "inicializacion" o similares)
        const snapshot = await db.collection('pedidos').where('descripcion', '==', 'inicializacion').get();
        let count = 0;
        const batch = db.batch();
        snapshot.forEach(doc => {
            batch.delete(doc.ref);
            count++;
        });
        if (count > 0) await batch.commit();
        registrarLogHelper('info', 'Limpieza de pedidos de prueba', { eliminados: count });
        res.json({ success: true, eliminados: count, message: "Limpieza de base de datos completada" });
    } catch (e) {
        registrarLogHelper('error', 'Fallo limpieza pedidos de prueba', { error: e.message });
        res.status(500).json({ success: false, error: e.message });
    }
});


// --- PURGA MAESTRA: ELIMINAR PEDIDOS DE PRUEBA EN FIRESTORE ---
apiRouter.post('/admin/purge-tests', async (req, res) => {
    try {
        const pedidosRef = db.collection('pedidos');
        const snapshot = await pedidosRef.get();
        let deletedCount = 0;

        const batch = db.batch();
        snapshot.forEach(doc => {
            if (doc.id.includes('LIVE_FINAL') || doc.id.includes('AUTO')) {
                batch.delete(doc.ref);
                deletedCount++;
            }
        });

        if (deletedCount > 0) {
            await batch.commit();
        }
        console.log(`🧹 Purga completada en Firestore: ${deletedCount} registros.`);
        res.json({ success: true, count: deletedCount });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Montar el router en /api
app.use('/api', apiRouter);

// Rutas de autenticación (mantener fuera del apiRouter si requieren middlewares especiales)
app.get('/api/auth/panel-token', authLimiter, panelTokenController);
app.get('/api/auth/driver-token', authLimiter, driverTokenController);
// app.get('/healthcheck', healthcheckController);
// app.get('/api/healthcheck', healthcheckController);
// app.get('/health', healthcheckController);



// El arranque inteligente ya está implementado arriba con iniciarServidor()

// --- MANEJO GLOBAL DE ERRORES: Reportar a Discord antes de reiniciar ---
process.on('uncaughtException', async (err) => {
    try {
        await enviarAlertaDiscord('❌ Error no capturado', err && err.stack ? err.stack : String(err), 15158332);
    } catch {}
    console.error('❌ Error no capturado:', err);
    process.exit(1);
});

process.on('unhandledRejection', async (reason) => {
    try {
        await enviarAlertaDiscord('❌ Rechazo no capturado', reason && reason.stack ? reason.stack : String(reason), 15158332);
    } catch {}
    console.error('❌ Rechazo no capturado:', reason);
    process.exit(1);
});

