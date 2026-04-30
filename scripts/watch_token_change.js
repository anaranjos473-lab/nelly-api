// Script: watch_token_change.js
// Monitorea cambios en el token FCM de un repartidor y notifica por consola/log

const admin = require('firebase-admin');
const serviceAccount = require('../nelly-admin.json');

if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        databaseURL: process.env.FIREBASE_DB_URL || 'https://nelly-app.firebaseio.com'
    });
}

const db = admin.database();
const idConductor = process.argv[2] || 'driver_demo';

console.log(`[WATCH] Escuchando cambios de token FCM para: ${idConductor}`);

const ref = db.ref(`repartidores_activos/${idConductor}/fcm_token`);
let lastToken = null;

ref.on('value', (snapshot) => {
    const token = snapshot.val();
    if (token && token !== lastToken) {
        if (lastToken !== null) {
            console.log(`\n[NOTIFICACIÓN] Token FCM actualizado para ${idConductor}:\n${token}\n`);
        } else {
            console.log(`[INFO] Token inicial detectado para ${idConductor}`);
        }
        lastToken = token;
    }
});

process.on('SIGINT', () => {
    ref.off();
    console.log('\n[WATCH] Listener detenido.');
    process.exit(0);
});
