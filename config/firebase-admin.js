

import firebaseAdmin from 'firebase-admin';
let initialized = false;

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
                credential: credentialFactory(serviceAccount),
                databaseURL: process.env.FIREBASE_DATABASE_URL || 'https://nelly-delivery-default-rtdb.firebaseio.com'
            });
            console.log('🔥 Firebase Admin inicializado correctamente');
        }
        initialized = true;
    }
    return admin;
}


