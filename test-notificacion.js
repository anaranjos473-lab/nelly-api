// Script de prueba para notificación push a repartidor

import fetch from 'node-fetch';

const url = "http://localhost:3000/api/notificaciones/notificar-repartidor"; // Cambia a tu URL de Render si aplica
const tokenFCM = "PEGA_EL_TOKEN_AQUI"; // Reemplaza por el token real

async function testNotificacion() {
    const body = {
        tokenFCM,
        numeroPedido: "105",
        direccion: "Centro, Tuxtla Gutiérrez"
    };
    try {
        const resp = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(body)
        });
        const data = await resp.json().catch(() => ({}));
        console.log("Status:", resp.status);
        console.log("Respuesta:", data);
    } catch (err) {
        console.error("Error en la petición:", err);
    }
}

testNotificacion();
