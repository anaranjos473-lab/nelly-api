const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference } = require('mercadopago');
const cors = require('cors'); // Paso 1: Importar CORS

dotenv.config();
const app = express();

app.use(cors()); // Paso 2: Habilitar CORS para permitir conexión desde Android
app.use(express.json());

// 1. Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// 2. Configuración de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MP_ACCESS_TOKEN
});

// --- RUTA PARA EL CHAT (POST /chat) ---
app.post('/chat', async (req, res) => {
  try {
    const { mensaje } = req.body;
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "Eres Nelly, una asistente de delivery amable en Tuxtla Gutiérrez." },
        { role: "user", content: mensaje }
      ],
    });
    res.send(completion.choices[0].message.content); // Devuelve texto plano para tu App
  } catch (error) {
    console.error(error);
    res.status(500).send("Error en el chat");
  }
});

// --- RUTA PARA EL PAGO (GET /pago/generar) ---
app.get('/pago/generar', async (req, res) => {
  try {
    const preference = new Preference(client);
    const result = await preference.create({
      body: {
        items: [{ title: 'Pedido Nelly Delivery', quantity: 1, unit_price: 150 }],
        back_urls: { success: "https://nelly-api-8lh1.onrender.com/success" },
        auto_return: "approved",
      }
    });
    res.json({ link: result.init_point }); // Devuelve el JSON con el link que espera Android
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Error al generar pago" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
