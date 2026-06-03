
import admin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
let initialized = false;

function normalizePrivateKey(privateKey) {
    return String(privateKey || '').replace(/\\n/g, '\n');
}

function getServiceAccountFromEnv() {
    const projectId = process.env.FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (!projectId || !clientEmail || !privateKey) {
        return null;
    }

    return {
        project_id: projectId,
        client_email: clientEmail,
        private_key: normalizePrivateKey(privateKey),
    };
}

export async function getAdmin() {
    if (!initialized && !admin.apps.length) {
        let serviceAccount = getServiceAccountFromEnv();
        if (serviceAccount) {
            console.log('Firebase Admin usando variables separadas de Render');
        } else if (process.env.FIREBASE_SERVICE_ACCOUNT) {
            try {
                serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
                if (serviceAccount.private_key) {
                    serviceAccount.private_key = normalizePrivateKey(serviceAccount.private_key);
                }
                console.log('Firebase Admin usando FIREBASE_SERVICE_ACCOUNT');
            } catch (e) {
                console.error('❌ Error al parsear FIREBASE_SERVICE_ACCOUNT:', e.message);
            }
        } else {
            try {
                // Compatibilidad multiplataforma para ruta absoluta
                let __dirname = path.dirname(new URL(import.meta.url).pathname);
                // Corrige rutas en Windows (quita '/' inicial si existe)
                if (process.platform === 'win32' && __dirname.startsWith('/')) {
                    __dirname = __dirname.slice(1);
                }
                const jsonPath = path.resolve(__dirname, '../nelly-admin.json');
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
