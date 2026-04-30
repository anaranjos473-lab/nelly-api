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
                serviceAccount = await import('../nelly-admin.json', { assert: { type: 'json' } }).then(m => m.default);
            } catch (e) {
                console.error('❌ No se encontró FIREBASE_SERVICE_ACCOUNT ni nelly-admin.json:', e.message);
            }
        }
        if (serviceAccount) {
            const opts = { credential: admin.credential.cert(serviceAccount) };
            if (process.env.FIREBASE_DATABASE_URL) {
                opts.databaseURL = process.env.FIREBASE_DATABASE_URL;
            }
            admin.initializeApp(opts);
            console.log('🔥 Firebase Admin inicializado correctamente');
        }
        initialized = true;
    }
    return admin;
}
