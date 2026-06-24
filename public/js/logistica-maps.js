// public/js/logistica-maps.js
console.log("LOGISTICA MAPS CARGADO");
// Mapa de calor de pedidos en Tuxtla Gutiérrez
let map, heatmap, repartidorMarkers = [], repartidoresVisible = true;

function safeInitMap() {
    if (typeof google === 'undefined' || !google.maps || !document.getElementById('map')) {
        return;
    }
    if (typeof window.initMap === 'function') {
        window.initMap();
        return;
    }
    initMap();
}

// Estilo "Nelly Night Mode" para Google Maps
const estilosOscuros = [
    { "elementType": "geometry", "stylers": [{ "color": "#212121" }] },
    { "elementType": "labels.icon", "stylers": [{ "visibility": "off" }] },
    { "elementType": "labels.text.fill", "stylers": [{ "color": "#757575" }] },
    { "elementType": "labels.text.stroke", "stylers": [{ "color": "#212121" }] },
    { "featureType": "administrative", "elementType": "geometry", "stylers": [{ "color": "#757575" }] },
    { "featureType": "poi", "elementType": "labels.text.fill", "stylers": [{ "color": "#3d3d3d" }] },
    { "featureType": "road", "elementType": "geometry.fill", "stylers": [{ "color": "#2c2c2c" }] },
    { "featureType": "road", "elementType": "labels.text.fill", "stylers": [{ "color": "#8a8a8a" }] },
    { "featureType": "road.highway", "elementType": "geometry", "stylers": [{ "color": "#3c3c3c" }] },
    { "featureType": "water", "elementType": "geometry", "stylers": [{ "color": "#000000" }] }
];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: 16.7527, lng: -93.1167 },
        styles: estilosOscuros, // Nelly Night Mode
        disableDefaultUI: true,
        zoomControl: true
    });

    // --- Toggle para mostrar/ocultar repartidores ---
    const toggle = document.getElementById('toggle-repartidores');
    if (toggle) {
        toggle.addEventListener('change', () => {
            repartidoresVisible = toggle.checked;
            repartidorMarkers.forEach(m => m.setMap(repartidoresVisible ? map : null));
        });
    }

    // --- Repartidores activos (RTDB) ---
    if (window.firebase?.database) {
        const dbRef = firebase.database().ref('repartidores_activos');
        dbRef.on('value', (snapshot) => {
            repartidorMarkers.forEach(marker => marker.setMap(null));
            repartidorMarkers = [];
            if (!repartidoresVisible) return;
            snapshot.forEach((child) => {
                const data = child.val();
                if (data.lat && data.lng) {
                    const marker = new google.maps.Marker({
                        position: { lat: data.lat, lng: data.lng },
                        map: map,
                        icon: 'assets/moto-icon.png',
                        title: data.displayName || child.key
                    });
                    repartidorMarkers.push(marker);
                }
            });
        });
    }

    // Heatmap deshabilitado temporalmente
}
window.initMap = initMap;
console.log("INITMAP REGISTRADO");
