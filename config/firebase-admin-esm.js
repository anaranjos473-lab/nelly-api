
import firebaseAdmin from 'firebase-admin';
import fs from 'fs';
import path from 'path';
let initialized = false;

// Firebase Admin v14 exposes services through product modules. Resolve them
// lazily so the existing firebase-admin Jest mocks remain valid.
let adminAdapterPromise = null;

async function getAdminAdapter() {
    if (typeof firebaseAdmin.database === 'function') return firebaseAdmin;

    if (!adminAdapterPromise) {
        adminAdapterPromise = Promise.all([
            import('firebase-admin/auth'),
            import('firebase-admin/database'),
            import('firebase-admin/firestore'),
            import('firebase-admin/storage')
        ]).then(([authModule, databaseModule, firestoreModule, storageModule]) => {
            const database = (...args) => databaseModule.getDatabase(...args);
            database.ServerValue = databaseModule.ServerValue;
            return {
                auth: (...args) => authModule.getAuth(...args),
                database,
                firestore: (...args) => firestoreModule.getFirestore(...args),
                storage: (...args) => storageModule.getStorage(...args),
                getApp: firebaseAdmin.getApp,
                getApps: firebaseAdmin.getApps,
                initializeApp: firebaseAdmin.initializeApp,
                cert: firebaseAdmin.cert
            };
        });
    }
    return adminAdapterPromise;
}

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
    const admin = await getAdminAdapter();
    const appCount = typeof admin.getApps === 'function'
        ? admin.getApps().length
        : Array.isArray(admin.apps) ? admin.apps.length : 0;
    if (!initialized && appCount === 0) {
        const credentialFactory = admin.cert || admin.credential?.cert;
        // Jest service doubles expose the product APIs but intentionally omit
        // application credentials. They are already initialized test doubles.
        if (typeof credentialFactory !== 'function') {
            if (process.env.NODE_ENV === 'test') {
                initialized = true;
                return admin;
            }
            throw new Error('Firebase Admin credential API is unavailable');
        }
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
            const opts = { credential: credentialFactory(serviceAccount) };
            opts.databaseURL = process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com';
            admin.initializeApp(opts);
            console.log('🔥 Firebase Admin inicializado correctamente');
        }
        initialized = true;
    }
    return admin;
}
