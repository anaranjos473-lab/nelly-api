// Script de prueba automatizada para listeners de chat Nelly (solo para desarrollo)
// Requiere: public/firebase.js correctamente configurado y usuario autenticado

import { rtdb, auth } from './firebase.js';

// Configura estos valores para la prueba
default const pedidoId = 'PRUEBA_LISTENER_001';
default const userId = 'UID_TEST_1';
default const otroUserId = 'UID_TEST_2';

// 1. Simula envío de mensaje
default async function enviarMensaje(texto, usuario) {
    const mensajesRef = rtdb.ref(`chats/${pedidoId}/mensajes`);
    const nuevoMensaje = {
        user: usuario,
        msg: texto,
        ts: Date.now()
    };
    await mensajesRef.push(nuevoMensaje);
    console.log('Mensaje enviado:', nuevoMensaje);
}

// 2. Listener de mensajes nuevos
function escucharMensajes() {
    const mensajesRef = rtdb.ref(`chats/${pedidoId}/mensajes`).limitToLast(10);
    mensajesRef.on('child_added', (snapshot) => {
        const mensaje = snapshot.val();
        console.log('Nuevo mensaje recibido:', mensaje);
    });
}

// 3. Simula estado "escribiendo"
default async function setEscribiendo(usuario, valor) {
    const escribiendoRef = rtdb.ref(`chats/${pedidoId}/metadatos/escribiendo/${usuario}`);
    await escribiendoRef.set(valor);
    console.log(`Usuario ${usuario} escribiendo:`, valor);
}

// 4. Listener de "escribiendo"
function escucharEscribiendo() {
    const escribiendoRef = rtdb.ref(`chats/${pedidoId}/metadatos/escribiendo`);
    escribiendoRef.on('value', (snapshot) => {
        const estados = snapshot.val();
        console.log('Estado escribiendo:', estados);
    });
}

// 5. Ejecución de prueba
auth.onAuthStateChanged((user) => {
    if (user) {
        escucharMensajes();
        escucharEscribiendo();
        // Simula actividad
        setEscribiendo(userId, true);
        setTimeout(() => setEscribiendo(userId, false), 3000);
        enviarMensaje('¡Hola, esto es una prueba!', userId);
        setTimeout(() => enviarMensaje('Respuesta de otro usuario', otroUserId), 2000);
    } else {
        console.warn('No autenticado. Inicia sesión para probar listeners.');
    }
});

// Nota: Borra o desactiva este script en producción.