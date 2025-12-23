const express = require('express');
const dotenv = require('dotenv');
const OpenAI = require('openai'); // Importamos la IA

dotenv.config();
const app = express();
app.use(express.json());

// Configuramos la IA con la llave que acabas de guardar en Render
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY 
});

// Ruta 1: La bienvenida (para comprobar que el servidor vive)
app.get('/', (req, res) => {
    res.json("¡Conexión Exitosa con Nelly!");
});

// Ruta 2: EL CEREBRO 🧠
// Cuando entres aquí, Nelly pensará una respuesta
app.get('/cerebro', async (req, res) => {
    try {
        console.log("Preguntando a la IA...");
        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: "Eres Nelly, una asistente útil y amable de una aplicación de delivery en Tuxtla Gutiérrez, Chiapas." },
                { role: "user", content: "Salúdame y dime qué puedes hacer por mí en una frase corta." }
            ],
            model: "gpt-3.5-turbo",
        });
        // Enviamos la respuesta de la IA
        res.json(completion.choices[0].message.content);
    } catch (error) {
        console.error(error);
        res.status(500).json("Error en el cerebro: " + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nelly API corriendo en el puerto ${PORT}`);
});
