const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago'); 
const cors = require('cors'); 
const admin = require('firebase-admin');
const fs = require('fs');
const axios = require('axios');
const { Resend } = require('resend'); // 1. Importación de Resend

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public"
app.use(express.static('public'));

// --- CONFIGURACIONES ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });
const resend = new Resend(process.env.RESEND_API_KEY); // 2. Inicialización de Resend

// --- CONFIGURACIÓN FIREBASE (Notificaciones) ---
let firebaseAdminInitialized = false;
let db = null;
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

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: process.env.FIREBASE_DATABASE_URL || "https://nelly-delivery-default-rtdb.firebaseio.com"
  });
  db = admin.database();
  firebaseAdminInitialized = true;
  console.log('✅ Firebase Admin conectado exitosamente');
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
const URL_DE_TU_API = process.env.RENDER_URL || 'https://tu-url-de-render.onrender.com'; // Cambia con tu URL real o usa variable de entorno

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
function validarCorreo(email) {
    const regexCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regexCorreo.test(email);
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

// --- RUTA 2.1: PEDIDO LISTO ---
app.post('/api/pedidos/listo', async (req, res) => {
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
});

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
        notification_url: "https://nelly-api-8lh1.onrender.com/webhook", 
        back_urls: { success: "https://nelly-api-8lh1.onrender.com/success" },
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

// --- RUTA: HEALTHCHECK (para Keep-Alive en Render) ---
app.get('/healthcheck', (req, res) => {
    res.status(200).send('OK');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nelly v3.0 listo en puerto ${PORT}`);
});