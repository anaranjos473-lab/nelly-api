import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

/**
 * Singleton de Firebase Admin
 * Garantiza una única instancia de la app incluso en entornos de redeploy rápido.
 */
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);

if (getApps().length === 0) {
    initializeApp({
        credential: cert(serviceAccount),
        // Aquí puedes añadir storageBucket más adelante para las fotos de evidencias
    });
    console.log("🔥 [Firebase] Inicialización Singleton exitosa.");
}

// Exportamos la instancia de base de datos para usarla en todo el proyecto
export const db = getFirestore();
