const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors'); 
const admin = require('firebase-admin'); // 1. 🔥 Importamos el Admin de Firebase

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

// ==========================================
// 🔐 CONFIGURACIÓN FIREBASE ADMIN (La Llave Maestra)
// ==========================================
try {
  // Asegúrate de que este archivo exista en tu carpeta
  const serviceAccount = require('./nelly-admin.json'); 
  
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com" // Tu base de datos
  });
  console.log("✅ Firebase Admin conectado correctamente");
} catch (error) {
  console.error("❌ Error conectando Firebase Admin (¿Falta el archivo json?):", error.message);
}

// 2. Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 3. Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// ==========================================
// 🧠 CEREBRO MATEMÁTICO (Fórmula Haversine)
// ==========================================
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; 
}

// --- RUTA PARA EL CHAT (POST /chat) ---
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { 
            role: "system", 
            content: "Eres Nelly, la asistente virtual más amable de Tuxtla Gutiérrez, Chiapas..." 
        },
        { role: "user", content: mensaje }
      ],
    });
    res.send(completion.choices[0].message.content); 
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el chat");
  }
});

// --- RUTA: COTIZADOR DINÁMICO (POST /api/pedidos/cotizar) ---
app.post('/api/pedidos/cotizar', async (req, res) => {
    try {
        const { latRestaurante, lonRestaurante, latCliente, lonCliente, subtotalComida, propina } = req.body;

        let distanciaKm = 3.0; 
        if(latRestaurante && latCliente) {
            distanciaKm = calcularDistancia(latRestaurante, lonRestaurante, latCliente, lonCliente);
        }
        
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
                ganancia_repartidor: gananciaRepartidor.toFixed(2),
                ganancia_restaurante: (subtotalComida * 0.85).toFixed(2), 
                ganancia_nelly_total: ((subtotalComida * 0.15) + TARIFA_SERVICIO).toFixed(2)
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error calculando tarifa" });
    }
});

// --- 🔔 NUEVA RUTA: ASIGNAR Y NOTIFICAR (POST /api/pedidos/asignar) ---
// Esta ruta es la que hace sonar el celular del repartidor
app.post('/api/pedidos/asignar', async (req, res) => {
    try {
        const { ganancia, repartidorId } = req.body;

        // 1. Buscamos el token del celular en Firebase
        const snapshot = await admin.database().ref(`repartidores/${repartidorId}/fcm_token`).once('value');
        const fcmToken = snapshot.val();

        if (!fcmToken) {
            return res.status(404).json({ error: "El repartidor no tiene token (App cerrada)" });
        }

        // 2. Preparamos el mensaje
        const message = {
            notification: {
                title: '¡NUEVO PEDIDO! 🍔',
                body: `Ganancia estimada: $${ganancia}. Toca para aceptar.`
            },
            token: fcmToken
        };

        // 3. Enviamos la notificación
        await admin.messaging().send(message);
        console.log(`🔔 Notificación enviada a ${repartidorId}`);

        res.json({ success: true, msg: "Alerta enviada correctamente" });

    } catch (error) {
        console.error("Error enviando notificación:", error);
        res.status(500).json({ error: "Error enviando alerta" });
    }
});

// --- RUTA PARA EL PAGO ---
app.post('/pago/generar', async (req, res) => {
  try {
    const { precio, titulo } = req.body;
    const precioFinal = precio ? parseFloat(precio) : 150;
    const tituloFinal = titulo || 'Pedido Nelly Delivery';

    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ 
            title: tituloFinal, 
            quantity: 1, 
            unit_price: precioFinal 
        }],
        back_urls: { success: "https://nelly-api-8lh1.onrender.com/success" },
        auto_return: "approved",
      }
    });
    res.json({ link: result.init_point }); 
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar pago" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor Nelly v2.0 corriendo en puerto ${PORT}`);
});
