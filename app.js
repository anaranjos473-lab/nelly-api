const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors'); 

dotenv.config();
const app = express();

app.use(cors()); 
app.use(express.json());

// 1. Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 2. Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// ==========================================
// 🧠 CEREBRO MATEMÁTICO (Fórmula Haversine)
// ==========================================
function calcularDistancia(lat1, lon1, lat2, lon2) {
    const R = 6371; // Radio de la tierra en km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = 
        Math.sin(dLat/2) * Math.sin(dLat/2) +
        Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c; // Retorna distancia en KM
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
            content: "Eres Nelly, la asistente virtual más amable de Tuxtla Gutiérrez, Chiapas. Tu tono es alegre y servicial. Usas expresiones locales ligeras como '¡Qué tal primo!' o '¡A la orden!'. Tu objetivo es vender comida deliciosa: Cochito horneado ($150), Tacos de Tasajo ($120) y Pozol de Cacao ($50). Si te preguntan por algo que no vendes, sugiere amablemente el Cochito. Respuestas cortas (máximo 40 palabras)." 
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

// --- NUEVO: COTIZADOR DINÁMICO (POST /api/pedidos/cotizar) ---
// Esta ruta la llamará tu Android App antes de pagar para saber cuánto cobrar
app.post('/api/pedidos/cotizar', async (req, res) => {
    try {
        const { latRestaurante, lonRestaurante, latCliente, lonCliente, subtotalComida, propina } = req.body;

        // 1. Calcular Distancia Real
        // Si no vienen coordenadas, asumimos una distancia promedio de 3km (para pruebas)
        let distanciaKm = 3.0; 
        if(latRestaurante && latCliente) {
            distanciaKm = calcularDistancia(latRestaurante, lonRestaurante, latCliente, lonCliente);
        }
        
        // 2. Configuración de Costos (Basado en tus capturas de pantalla)
        const TARIFA_BASE = 16.50;      //
        const PRECIO_POR_KM = 4.00;     // Promedio mercado
        const TARIFA_SERVICIO = 2.50;   // Ganancia neta Nelly
        
        // 3. Cálculos Financieros
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
                ganancia_restaurante: (subtotalComida * 0.85).toFixed(2), // 85% para restaurante
                ganancia_nelly_total: ((subtotalComida * 0.15) + TARIFA_SERVICIO).toFixed(2) // 15% + servicio
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Error calculando tarifa" });
    }
});

// --- RUTA PARA EL PAGO (Ahora acepta precio dinámico) ---
// POST o GET (Cambiamos a POST para recibir el precio en el cuerpo)
app.post('/pago/generar', async (req, res) => {
  try {
    // Recibimos el precio calculado, si no viene, usamos 150 por defecto
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
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
