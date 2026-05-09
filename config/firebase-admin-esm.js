
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
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
                const __dirname = path.dirname(new URL(import.meta.url).pathname.replace(/^\/+([A-Za-z]:)/, '$1'));
                const jsonPath = path.join(__dirname, '../nelly-admin.json');
                const jsonData = fs.readFileSync(jsonPath, 'utf8');
                serviceAccount = JSON.parse(jsonData);
            } catch (e) {
                console.error('❌ No se encontró FIREBASE_SERVICE_ACCOUNT ni nelly-admin.json:', e.message);
            }
        }
        if (serviceAccount) {
            const opts = { credential: admin.credential.cert(serviceAccount) };
            opts.databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
            admin.initializeApp(opts);
            console.log('🔥 Firebase Admin inicializado correctamente');
        }
        initialized = true;
    }
    return admin;
}
