const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference, Payment } = require('mercadopago'); 
const cors = require('cors'); 
const admin = require('firebase-admin');

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

// Servir archivos estáticos desde la carpeta "public" (panel.html, assets)
app.use(express.static('public'));

// --- CONFIGURACIÓN FIREBASE (Notificaciones) ---
try {
  // Asegúrate de que el archivo nelly-admin.json exista en la misma carpeta
  const serviceAccount = require('./nelly-admin.json'); 
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com"
  });
  console.log("✅ Firebase Admin conectado");
} catch (error) {
  console.error("❌ Error con Firebase Admin:", error.message);
}

// --- CONFIGURACIONES ---
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

// --- MATEMÁTICAS (Haversine) ---
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

// --- RUTA 1: CHAT IA ---
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres Nelly, asistente de delivery en Tuxtla..." },
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
            backend_data: {
                ganancia_repartidor: gananciaRepartidor.toFixed(2)
            }
        });
    } catch (error) { res.status(500).json({ error: "Error cotizando" }); }
});

// --- RUTA 3: GENERAR PAGO (CORREGIDA) ---
app.post('/pago/generar', async (req, res) => {
  try {
    console.log("📥 Solicitud de pago recibida:", req.body); // Log para ver qué llega

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [
            { 
                title: req.body.titulo || 'Pedido Nelly', 
                quantity: 1, 
                // CORRECCIÓN CLAVE AQUÍ ABAJO 👇
                unit_price: Number(req.body.precio) || 150, 
                currency_id: "MXN" // Importante para evitar errores de divisa
            }
        ],
        notification_url: "https://nelly-api-8lh1.onrender.com/webhook", 
        back_urls: { success: "https://nelly-api-8lh1.onrender.com/success" },
        auto_return: "approved",
      }
    });
    
    console.log("✅ Link generado:", result.init_point);
    res.json({ link: result.init_point }); 
  } catch (error) { 
      console.error("❌ Error generando pago:", error); // Ver el error real en logs
      res.status(500).json({ error: "Error pago", detalle: error.message }); 
  }
});

// --- RUTA 4: EL WEBHOOK ---
app.post('/webhook', async (req, res) => {
    const { type, data } = req.body; 
    
    try {
        if (type === 'payment') {
            const payment = new Payment(client);
            const infoPago = await payment.get({ id: data.id });
            
            if (infoPago.status === 'approved') {
                console.log(`💰 PAGO APROBADO: $${infoPago.transaction_amount}`);
                
                // NOTIFICAR AL REPARTIDOR (DRIVER_123)
                try {
                    const snapshot = await admin.database().ref(`repartidores/driver_123/fcm_token`).once('value');
                    const fcmToken = snapshot.val();

                    if (fcmToken) {
                        const mensaje = {
                            notification: {
                                title: '¡PAGO RECIBIDO! 🤑',
                                body: `Nuevo pedido pagado por $${infoPago.transaction_amount}. ¡A rodar!`
                            },
                            token: fcmToken
                        };
                        await admin.messaging().send(mensaje);
                        console.log("🔔 Notificación enviada a driver_123");
                    } else {
                        console.log("⚠️ No se encontró token FCM para driver_123");
                    }
                } catch (errToken) {
                    console.error("Error enviando notificación:", errToken);
                }
            }
        }
        res.sendStatus(200); 
    } catch (error) {
        console.error("Error en webhook:", error);
        res.sendStatus(500);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nelly v3.0 (Con Webhooks) corriendo en puerto ${PORT}`);
});