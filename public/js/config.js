// Configuración Maestra Nelly Delivery
const firebaseConfig = {
  apiKey: "AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E",
  authDomain: "nelly-delivery.firebaseapp.com",
  databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com",
  projectId: "nelly-delivery",
  storageBucket: "nelly-delivery.firebasestorage.app",
  messagingSenderId: "5451083162",
  appId: "1:5451083162:web:06b03a76f50b74b60bde23",
  measurementId: "G-0H2BKP1G8L"
};

// Inicialización para Scripts Clásicos
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}

// Variables globales para que logistica-maps.js las vea
const db = firebase.firestore();
const rtdb = firebase.database();

console.log("🔥 Nelly API: Sistema de Datos Conectado");
