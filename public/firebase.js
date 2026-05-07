import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-database.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/10.12.5/firebase-storage.js";

// Este archivo solo debe usarse en desarrollo local.
// En producción, la configuración de Firebase se obtiene vía endpoint seguro en el panel.
if (process.env.NODE_ENV !== 'production') {
    const firebaseConfig = {
        apiKey: "AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E",
        authDomain: "nelly-delivery.firebaseapp.com",
        projectId: "nelly-delivery",
        storageBucket: "nelly-delivery.firebasestorage.app",
        messagingSenderId: "5451083162",
        appId: "1:5451083162:web:06b03a76f50b74b60bde23"
    };
    const app = initializeApp(firebaseConfig);
    export const db = getFirestore(app);
    export const auth = getAuth(app);
    export const rtdb = getDatabase(app);
    export const storage = getStorage(app);
}
