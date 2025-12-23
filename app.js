const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai'); // 1. Importamos la librería de OpenAI

dotenv.config();
const app = express();
app.use(express.json());

// 2. Configuramos el cerebro usando la llave que guardaste en Render
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

// Ruta Principal (La que ya funciona)
app.get('/', (req, res) => {
    res.json("¡Conexión Exitosa con Nelly!");
});

// --- NUEVA RUTA: EL CEREBRO ---
// Cuando entres aquí, Nelly usará la IA para responder
app.get('/cerebro', async (req, res) => {
    try {
        console.log("Preguntándole al cerebro...");
        // Le pedimos a Nelly que se presente
        const completion = await openai.chat.completions.create({
            messages: [{ role: "user", content: "Preséntate brevemente en 20 palabras como Nelly, una asistente de delivery en Tuxtla." }],
            model: "gpt-3.5-turbo",
        });
        // Respondemos al celular con lo que dijo la IA
        res.json(completion.choices[0].message.content);
    } catch (error) {
        console.error("Error en OpenAI:", error);
        res.status(500).json("Error en el cerebro: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nelly API corriendo en el puerto ${PORT}`);
});
