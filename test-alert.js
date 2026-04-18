
require('dotenv').config();
const axios = require('axios');
(async () => {
    const DISCORD_WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;
    console.log('Enviando alerta a:', DISCORD_WEBHOOK_URL);
    try {
        await axios.post(DISCORD_WEBHOOK_URL, {
            content: '?? **ALERTA CRÍTICA** ??\nFalla en servidor Nelly API\nError: Test de comunicación exitoso.'
        });
        console.log('? Alerta enviada correctamente.');
    } catch (e) {
        console.error('? Error al enviar alerta:', e.message);
    }
})();
