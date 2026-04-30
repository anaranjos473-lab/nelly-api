// public/js/logistica-maps.js
// Mapa de calor de pedidos en Tuxtla Gutiérrez
let map, heatmap, repartidorMarkers = [], repartidoresVisible = true;

// Estilo oscuro para Google Maps
const estilosOscuros = [
  { elementType: 'geometry', stylers: [{ color: '#181c24' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#181c24' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8ec3b9' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ color: '#1a232f' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#232b3b' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#232b3b' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#181c24' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0e1626' }] }
];

function initMap() {
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: 16.7527, lng: -93.1167 },
        mapTypeId: "roadmap",
        styles: estilosOscuros
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

    // --- Pedidos (Heatmap, Firestore) ---
    if (!window.firebase?.firestore) {
        alert('Firestore SDK no cargado');
        return;
    }
    const pedidosRef = firebase.firestore().collection("pedidos");
    pedidosRef.onSnapshot((snapshot) => {
        const puntosCalor = [];
        snapshot.forEach((doc) => {
            const data = doc.data();
            if (data.ubicacion) {
                puntosCalor.push(new google.maps.LatLng(data.ubicacion.lat, data.ubicacion.lng));
            }
        });
        // --- Radio dinámico ---
        let radio = 60;
        if (puntosCalor.length > 40) radio = 20;
        else if (puntosCalor.length > 20) radio = 30;
        else if (puntosCalor.length > 10) radio = 40;
        else if (puntosCalor.length > 3) radio = 50;

        if (heatmap) heatmap.setMap(null);
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: puntosCalor,
            map: map,
            radius: radio,
            opacity: 0.7
        });
    });
}
window.initMap = initMap;
