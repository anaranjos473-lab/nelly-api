// Configuración de Firebase (ajusta según tu proyecto)
const firebaseConfig = {
    apiKey: "TU_API_KEY_FIREBASE",
    authDomain: "TU_DOMINIO.firebaseapp.com",
    databaseURL: "https://TU_DOMINIO.firebaseio.com",
    projectId: "TU_DOMINIO",
    storageBucket: "TU_DOMINIO.appspot.com",
    messagingSenderId: "TU_MESSAGING_ID",
    appId: "TU_APP_ID"
};

firebase.initializeApp(firebaseConfig);

let markers = [];

function initMap() {
    const map = new google.maps.Map(document.getElementById("map"), {
        center: { lat: 16.7527, lng: -93.1167 },
        zoom: 13
    });

    const dbRef = firebase.database().ref('repartidores_activos');
    dbRef.on('value', (snapshot) => {
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
