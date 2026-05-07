// config/firebase-config.js
// Configuración modular para Firebase v9+
// Exporta el objeto de configuración para uso en middlewares y tests

// Configuración protegida: se expone solo vía endpoint seguro
export function getFirebaseConfig() {
  return {
    apiKey: process.env.FIREBASE_API_KEY,
    authDomain: process.env.FIREBASE_AUTH_DOMAIN,
    databaseURL: process.env.FIREBASE_DATABASE_URL,
    projectId: process.env.FIREBASE_PROJECT_ID,
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.FIREBASE_APP_ID,
    measurementId: process.env.FIREBASE_MEASUREMENT_ID
  };
}

// Exportación default para compatibilidad con backend, tests, Nelly Admin y Nelly Drive
const firebaseConfig = getFirebaseConfig();
export default firebaseConfig;
