const express = require('express');
const dotenv = require('dotenv');

dotenv.config();
const app = express();
app.use(express.json());

// --- AQUÍ ESTÁ EL SALUDO QUE BUSCA TU CELULAR ---
// Cuando la App entre a la puerta principal ('/'), respondemos esto:
app.get('/', (req, res) => {
    res.json("¡Conexión Exitosa con Nelly!");
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Nelly API corriendo en el puerto ${PORT}`);
});
