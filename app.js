const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference } = require('mercadopago');

dotenv.config();
const app = express();
app.use(express.json());

// 1. Configuración de OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

// 2. Configuración de Mercado Pago
const client = new MercadoPagoConfig({ 
  accessToken: process.env.MP_ACCESS_TOKEN 
});

app.get('/', (req, res) => {
    res.json("¡Nelly está lista!");
});

// Ruta actualizada para recibir mensajes del usuario
app.post('/cerebro', async (req, res) => {
    try {
        const { mensaje } = req.body; // Aquí llega lo que el usuario escribe en el celular
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "Eres Nelly, una asistente de delivery amable en Tuxtla Gutiérrez." },
                { role: "user", content: mensaje }
            ],
            model: "gpt-3.5-turbo",
        });
        res.json(completion.choices[0].message.content);
    } catch (error) {
        res.status(500).json("Error: " + error.message);
    }
});

// --- RUTA DE PAGO ---
app.get('/pagar', async (req, res) => {
    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [
                    {
                        title: 'Pedido de Comida - Nelly Delivery',
                        quantity: 1,
                        unit_price: 150.00,
                        currency_id: 'MXN'
                    }
                ],
                auto_return: "approved",
            }
        });
        res.json({ link: result.init_point });
    } catch (error) {
        res.status(500).json("Error al crear cobro: " + error.message);
    }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
    console.log(`Servidor de Nelly en puerto ${PORT}`);
});


