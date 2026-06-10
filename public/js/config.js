// Configuración Maestra Nelly Delivery (Firebase Modular v9+)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

export const firebaseConfig = {
  apiKey: "AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E",
  authDomain: "nelly-delivery.firebaseapp.com",
  databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com",
  projectId: "nelly-delivery",
  storageBucket: "nelly-delivery.firebasestorage.app",
  messagingSenderId: "5451083162",
  appId: "1:5451083162:web:06b03a76f50b74b60bde23",
  measurementId: "G-0H2BKP1G8L"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const rtdb = getDatabase(app);

console.log("🔥 Nelly API: Sistema de Datos Conectado (modular)");
