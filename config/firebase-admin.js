

import admin from 'firebase-admin';
let initialized = false;

export async function getAdmin() {
    if (!initialized && !admin.apps.length) {
        let serviceAccount = null;
        if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
            } catch (e) {
                console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:', e.message);
            }
        } else {
            try {
                serviceAccount = await import('../nelly-admin.json', { with: { type: 'json' } }).then(m => m.default);
            } catch (e) {
                console.error('❌ No se encontró FIREBASE_SERVICE_ACCOUNT ni nelly-admin.json:', e.message);
            }
        }
        if (serviceAccount) {
            admin.initializeApp({ 
                credential: admin.credential.cert(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
            });
            console.log('🔥 Firebase Admin inicializado correctamente');
        }
        initialized = true;
    }
    return admin;
}


