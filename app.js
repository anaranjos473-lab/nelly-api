const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai');
const { MercadoPagoConfig, Preference } = require('mercadopago');

dotenv.config();
const app = express();
app.use(express.json());

// Configuración de OpenAI (Cerebro)
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// Configuración de Mercado Pago (Billetera)
const client = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN });

app.get('/', (req, res) => {
    res.json("¡Nelly está lista para cobrar y pensar!");
});

// RUTA PARA COBRAR 💸
app.get('/pagar', async (req, res) => {
    try {
        const preference = new Preference(client);
        const result = await preference.create({
            body: {
                items: [{
                    title: 'Pedido de Comida - Nelly Delivery',
                    quantity: 1,
                    unit_price: 150.00, // Precio de prueba
                    currency_id: 'MXN'
                }],
                back_urls: { success: "https://www.google.com" },
                auto_return: "approved",
            }
        });
        res.json({ link: result.init_point });
    } catch (error) {
        res.status(500).json("Error al crear cobro: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor de Nelly en puerto ${PORT}`);
});
