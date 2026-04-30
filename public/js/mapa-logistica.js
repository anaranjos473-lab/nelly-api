// Configuración de Firebase Modular v9+
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getDatabase, ref, onValue } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyAhHZvA2T-1xkIrCBpljgWPzDmynucT9_E",
    authDomain: "nelly-delivery.firebaseapp.com",
    databaseURL: "https://nelly-delivery-default-rtdb.firebaseio.com",
    projectId: "nelly-delivery",
    storageBucket: "nelly-delivery.firebasestorage.app",
    messagingSenderId: "5451083162",
    appId: "1:5451083162:web:06b03a76f50b74b60bde23"
};

const app = initializeApp(firebaseConfig);
const rtdb = getDatabase(app);

let markers = [];

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 16.7527, lng: -93.1167 },
        zoom: 13
    });

    const dbRef = ref(rtdb, 'repartidores_activos');
    onValue(dbRef, (snapshot) => {
        // Limpiar marcadores viejos
        markers.forEach(marker => marker.setMap(null));
        markers = [];
        // Dibujar nuevos
        snapshot.forEach((child) => {
            const data = child.val();
            const marker = new google.maps.Marker({
                position: { lat: data.lat, lng: data.lng },
                map: map,
                icon: 'assets/moto-icon.png',
                title: data.displayName || child.key
            });
            markers.push(marker);
        });
    });
}
