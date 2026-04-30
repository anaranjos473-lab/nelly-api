// public/js/logistica-maps.js
// Mapa de calor de pedidos en Tuxtla Gutiérrez
let map, heatmap;

function initMap() {
    // 1. Centrar en Tuxtla Gutiérrez
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 13,
        center: { lat: 16.7527, lng: -93.1167 },
        mapTypeId: "roadmap",
        styles: window.estilosOscuros || [] // Usa estilos oscuros si están definidos
    });

    // 2. Escuchar pedidos en tiempo real (Firestore)
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
        // 3. Crear o actualizar la capa de calor
        if (heatmap) heatmap.setMap(null);
        heatmap = new google.maps.visualization.HeatmapLayer({
            data: puntosCalor,
            map: map,
            radius: 30,
            opacity: 0.7
        });
    });
}
window.initMap = initMap;
