const express = require('express');
const router = require('./router.js');
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

// Log global de errores y rechazos no capturados
process.on('uncaughtException', async (err) => {
    console.error('❌ [GLOBAL][uncaughtException]', err);
    await notificarAlertaCritica(`Error crítico en producción: ${err.message}`);
    process.exit(1);
});
process.on('unhandledRejection', async (reason, _promise) => {
    console.error('❌ [GLOBAL][unhandledRejection]', reason);
    await notificarAlertaCritica(`Rechazo no capturado: ${reason}`);
});

// Pulso local para mantener logs y actividad (también fuera de producción)
setInterval(() => {
    console.log("💓 Pulso local: Nelly sigue activa...");
}, 30000); // Cada 30 segundos
// --- INICIALIZACIÓN DE FIREBASE Y BLOQUES DEPENDIENTES ---
let firebaseAdminInitialized = false;
let db = null;

// ...código de inicialización de Firebase y db...

// --- BLOQUES QUE DEPENDEN DE FIREBASE ---
function inicializarDependientesFirebase() {
    // Monitor de salud de Firebase
    if (firebaseAdminInitialized && db) {
        const dbStatusRef = db.ref(".info/connected");
        dbStatusRef.on("value", (snap) => {
            if (snap.val() === true) {
                console.log("✅ Conectado a Firebase RTDB");
            } else {
                const msg = "Nelly perdió conexión con la base de datos.";
                console.error("🚨 ALERTA: " + msg);
                notificarAlertaConexion(msg);
            }
        });

        // Limpieza automática de pedidos de prueba al arrancar
        (async function limpiarPruebas() {
            try {
                console.log("🧹 Iniciando limpieza de pedidos de prueba...");
                const ref = db.ref('pedidos');
                const snapshot = await ref.once('value');
                snapshot.forEach((child) => {
                    if (child.key.startsWith('test_') || child.key.startsWith('AUTO_')) {
                        child.ref.remove();
                    }
                });
                console.log("✨ Base de datos limpia de logs de prueba.");
            } catch (e) {
                console.error("❌ Error limpiando pruebas:", e.message);
            }
        })();

        // Ejecución periódica del smoke test
        try {
            const cron = require('node-cron');
            cron.schedule('*/15 * * * *', () => {
                console.log('⏱️ Ejecutando smoke-test.js (cada 15 minutos)...');
                require('child_process').exec('node smoke-test.js', (err, stdout, stderr) => {
                    if (err) {
                        console.error('❌ Error ejecutando smoke-test.js:', err.message);
                    } else {
                        console.log(stdout);
                        if (stderr) console.error(stderr);
                    }
                });
            });
        } catch (e) {
            console.error('No se pudo cargar node-cron para el smoke test automático:', e.message);
        }
    }
}
//
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago'); 
const cors = require('cors'); 
const rateLimit = require('express-rate-limit');
const admin = require('firebase-admin');
const fs = require('fs');
const { Client: GoogleMapsClient } = require('@googlemaps/google-maps-services-js');
const { Resend } = require('resend'); // 1. Importación de Resend

const app = express();
// Montar rutas de monitoreo externo
app.use('/api', router);

function requireOrderApiKey(req, res, next) {
    if (!ORDER_INGEST_API_KEY) {
        if (process.env.NODE_ENV === 'production') {
            return res.status(503).json({ error: 'ORDER_INGEST_API_KEY no configurada en servidor' });
        }
        return next();
    }

    const provided = String(req.headers['x-api-key'] || '').trim();
    if (!provided || provided !== ORDER_INGEST_API_KEY) {
        return res.status(401).json({ error: 'API key invalida' });
    }

    return next();
}

function normalizeOrigin(originValue) {
    return String(originValue || '').trim().replace(/\/$/, '').toLowerCase();
}

const PANEL_ALLOWED_ORIGIN = normalizeOrigin(process.env.PANEL_ALLOWED_ORIGIN || 'https://nelly-delivery.web.app');
const PANEL_LIQUIDACIONES_API_KEY = String(process.env.PANEL_LIQUIDACIONES_API_KEY || '').trim();
const ECOSYSTEM_VERSION = process.env.ECOSYSTEM_VERSION || '4.0.0-PRO';

app.set('trust proxy', 1);

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin) {
            return callback(null, false);
        }

        const normalizedOrigin = normalizeOrigin(origin);
        if (normalizedOrigin === PANEL_ALLOWED_ORIGIN) {
            return callback(null, true);
        }

        return callback(null, false);
    },
    methods: ['GET', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: false,
    optionsSuccessStatus: 200
};

app.use('/api/auth', cors(corsOptions));
app.options('/api/auth/panel-token', cors(corsOptions));

const openCors = cors();
app.use((req, res, next) => {
    if (req.path.startsWith('/api/auth')) {
        return next();
    }
    return openCors(req, res, next);
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: { error: 'Demasiados intentos. Intenta mas tarde.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const etaLimiter = rateLimit({
    windowMs: 60 * 1000,
    max: 120,
    message: { error: 'Demasiadas consultas de ETA. Intenta en unos segundos.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// --- CONFIGURACIONES ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const resend = new Resend(process.env.RESEND_API_KEY); // 2. Inicialización de Resend
const googleMapsClient = new GoogleMapsClient({});


// --- CONFIGURACIÓN FIREBASE (Notificaciones) ---
try {
    let serviceAccount;
    const secretPath = "/etc/secrets/nelly-admin.json"; 

    if (fs.existsSync(secretPath)) {
        serviceAccount = require(secretPath);
        console.log('✅ Firebase Admin: Cargado desde Secret File en Render');
    } else if (process.env.FIREBASE_ADMIN_JSON) {
        const rawEnv = process.env.FIREBASE_ADMIN_JSON;
        serviceAccount = rawEnv.trim().startsWith('{') 
            ? JSON.parse(rawEnv) 
            : JSON.parse(Buffer.from(rawEnv, 'base64').toString('utf8'));
        console.log('ℹ️ Firebase Admin: Cargado desde FIREBASE_ADMIN_JSON');
    } else {
        serviceAccount = require('./nelly-admin.json');
        console.log('ℹ️ Firebase Admin: Cargado desde archivo local');
    }

    const firebaseDatabaseUrl = process.env.FIREBASE_DATABASE_URL || "https://nelly-delivery-default-rtdb.firebaseio.com";
    if (!process.env.FIREBASE_DATABASE_URL) {
        console.warn('⚠️ FIREBASE_DATABASE_URL no está configurada. En Render, fija esta variable de entorno al URL de tu proyecto Firebase RTDB.');
    }

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: firebaseDatabaseUrl
    });
    db = admin.database();
    firebaseAdminInitialized = true;
    console.log('✅ Firebase Admin conectado exitosamente');
    inicializarDependientesFirebase();
} catch (error) {
    console.error("❌ Error Crítico Firebase:", error.message);
    if (error.message && (error.message.includes('invalid_grant') || error.message.includes('Invalid JWT Signature'))) {
        console.error('⚠️ Verifica la clave de servicio de Firebase en nelly-admin.json o la variable FIREBASE_ADMIN_JSON.');
        console.error('   - Asegúrate de que el archivo no esté revocado.');
        console.error('   - Revisa que la clave JSON sea la correcta para el proyecto.');
        console.error('   - Si usas env var, valida que sea JSON válido o base64 válido.');
        console.error('   - Si el problema persiste, sincroniza el reloj del servidor.');
    }
}

// --- Verificación inmediata de Firebase Admin ---
const checkFirebase = async () => {
    if (!firebaseAdminInitialized) {
        console.error('❌ Firebase Admin no inicializado: omitiendo verificación.');
        return;
    }
    try {
        await admin.auth().listUsers(1);
        console.log('✅ Firebase Admin: Conexión verificada y activa');
    } catch (error) {
        console.error('❌ Error crítico en Firebase:', error.message);
    }
};
checkFirebase();

const requireFirebase = (res) => {
    if (!firebaseAdminInitialized) {
        res.status(500).json({ error: 'Firebase Admin no está inicializado. Revisa las credenciales de servicio.' });
        return false;
    }
    return true;
};

// --- MIDDLEWARE: VALIDACION DE IDENTIDAD DEL REPARTIDOR ---
const requireDriverAuth = async (req, res, next) => {
    const authHeader = req.headers.authorization || '';
    const idToken = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

    if (!idToken) {
        return res.status(401).json({ error: 'No se proporciono token' });
    }

    if (!firebaseAdminInitialized) {
        return res.status(503).json({ error: 'Firebase Admin no inicializado' });
    }

    try {
        const decodedToken = await admin.auth().verifyIdToken(idToken);
        if (decodedToken.driver === true || decodedToken.role === 'repartidor') {
            req.user = decodedToken;
            return next();
        }

        return res.status(403).json({ error: 'Acceso denegado: No es un perfil de repartidor' });
    } catch (error) {
        console.error('[AUTH ERROR Driver]:', error.message);
        return res.status(401).json({ error: 'Token invalido o expirado' });
    }
};

const requirePanelApiKey = (req, res, next) => {
    if (!PANEL_LIQUIDACIONES_API_KEY) {
        return next();
    }

    const provided = String(req.headers['x-panel-key'] || '').trim();
    if (!provided || provided !== PANEL_LIQUIDACIONES_API_KEY) {
        return res.status(401).json({ error: 'x-panel-key invalido' });
    }

    return next();
};

// --- LISTENER DE PEDIDOS (Panel de Cocina) ---
if (firebaseAdminInitialized) {
  const pedidosRef = db.ref('pedidos');

  pedidosRef.on('child_added', (snapshot) => {
      const nuevoPedido = snapshot.val();
      console.log("📦 Nuevo pedido recibido para cocina:", nuevoPedido);
      // Aquí puedes disparar la lógica para actualizar el panel.html
  });
} else {
  console.log('⚠️ Omitiendo listener de pedidos porque Firebase Admin no está inicializado.');
}

// --- KEEP-ALIVE: Script para mantener el servidor despierto en Render ---
const URL_DE_TU_API = process.env.RENDER_URL || 'https://nelly-api-8lh1.onrender.com'; // Base URL canónica para keep-alive

if (process.env.NODE_ENV === 'production') {
    setInterval(async () => {
        try {
            await axios.get(`${URL_DE_TU_API}/healthcheck`);
            console.log('📡 Keep-Alive: Ping enviado para evitar inactividad');
        } catch (err) {
            console.log('📡 Keep-Alive: Error en el ping, pero el servidor sigue intentando');
        }
    }, 14 * 60 * 1000); // 14 minutos en milisegundos
}

// --- MATEMÁTICAS (Haversine) ---
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

// --- VALIDACIÓN DE CORREO ELECTRÓNICO ---
function validarCorreo(email) { // eslint-disable-line no-unused-vars
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(email);
}

function esCoordenadaValida(lat, lng) {
    return Number.isFinite(lat)
        && Number.isFinite(lng)
        && lat >= -90
        && lat <= 90
        && lng >= -180
        && lng <= 180;
}

function distanciaMetrosHaversine(lat1, lng1, lat2, lng2) {
    const R = 6371e3;
    const p1 = lat1 * Math.PI / 180;
    const p2 = lat2 * Math.PI / 180;
    const dp = (lat2 - lat1) * Math.PI / 180;
    const dl = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2;
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
}

function parseCoordInput(value) {
    if (typeof value === 'string') {
        const parts = value.split(',').map((p) => Number(p.trim()));
        if (parts.length === 2) {
            const [lat, lng] = parts;
            return esCoordenadaValida(lat, lng) ? { lat, lng } : null;
        }
        return null;
    }

    if (value && typeof value === 'object') {
        const lat = Number(value.lat ?? value.latitude);
        const lng = Number(value.lng ?? value.lon ?? value.longitude);
        return esCoordenadaValida(lat, lng) ? { lat, lng } : null;
    }

    return null;
}

// --- RUTA 1: CHAT IA (Actualizado a GPT-4o-mini) ---
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Modelo más rápido y económico
      messages: [
        { role: "system", content: "Eres Nelly, la asistente de delivery más eficiente de Tuxtla. Amable y servicial." },
        { role: "user", content: mensaje }
      ],
    });
    res.send(completion.choices[0].message.content); 
  } catch (error) { res.status(500).send("Error chat"); }
});

// --- RUTA 2: COTIZAR ---
app.post('/api/pedidos/cotizar', async (req, res) => {
    try {
        const { latRestaurante, lonRestaurante, latCliente, lonCliente, subtotalComida, propina } = req.body;
        let distanciaKm = 3.0; 
        if(latRestaurante && latCliente) distanciaKm = calcularDistancia(latRestaurante, lonRestaurante, latCliente, lonCliente);
        
        const TARIFA_BASE = 16.50;      
        const PRECIO_POR_KM = 4.00;     
        const TARIFA_SERVICIO = 2.50;   
        
        const costoEnvio = TARIFA_BASE + (distanciaKm * PRECIO_POR_KM);
        const totalCliente = parseFloat(subtotalComida) + costoEnvio + TARIFA_SERVICIO + (parseFloat(propina) || 0);
        const gananciaRepartidor = costoEnvio + (parseFloat(propina) || 0);

        res.json({
            desglose: {
                distancia: distanciaKm.toFixed(2) + " km",
                costo_envio: costoEnvio.toFixed(2),
                tarifa_servicio: TARIFA_SERVICIO.toFixed(2),
                propina: propina || 0,
                total_pagar: totalCliente.toFixed(2)
            },
            backend_data: { ganancia_repartidor: gananciaRepartidor.toFixed(2) }
        });
    } catch (error) { res.status(500).json({ error: "Error cotizando" }); }
});

// --- RUTA 2.0: CREAR PEDIDO (SMOKE TEST / API) ---
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

        await admin.messaging().send(message);
        console.log(`🔔 Notificación FCM enviada para pedido ${pedidoId}`);
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
                        token: fcmToken
                    };
                    await admin.messaging().send(mensaje);
                    console.log("🔔 Notificación enviada");
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

// --- CONTROLADOR: HEALTHCHECK (para Keep-Alive en Render) ---
const healthcheckController = (req, res) => {
    return res.status(200).json({
        status: 'ok',
        service: 'nelly-api',
        versionSistema: ECOSYSTEM_VERSION,
        timestamp: new Date().toISOString(),
    });
};

// --- RUTAS EXPUESTAS ---
app.get('/api/auth/panel-token', authLimiter, panelTokenController);
app.get('/healthcheck', healthcheckController);
app.get('/api/healthcheck', healthcheckController);
app.get('/health', healthcheckController);

const PORT = process.env.PORT || 3000;
const server = app.listen(PORT, () => {
  console.log(`🚀 Servidor Nelly v3.0 listo en puerto ${PORT}`);
});

server.on('error', (err) => {
  console.error('❌ Error crítico del servidor:', err.message);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  console.error('⚠️ Promesa rechazada no manejada:', reason);
});