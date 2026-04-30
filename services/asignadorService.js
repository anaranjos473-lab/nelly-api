import { getDistance } from 'geolib';
import admin from '../config/firebase-config.js';

export const buscarRepartidorCercano = async (latPedido, lngPedido) => {
    // 1. Obtener todos los repartidores que estén "Online" y "Libres"
    const repartidoresSnap = await admin.database().ref('repartidores_activos')
        .orderByChild('estado')
        .equalTo('ONLINE')
        .once('value');

    const repartidores = [];
    repartidoresSnap.forEach(child => {
        repartidores.push({ id: child.key, ...child.val() });
    });

    if (repartidores.length === 0) return null;

    // 2. Calcular distancias y filtrar por radio (ej. 5km)
    const candidatos = repartidores.map(rep => {
        const distancia = getDistance(
            { latitude: latPedido, longitude: lngPedido },
            { latitude: rep.lat, longitude: rep.lng }
        );
        return { ...rep, distanciaMetros: distancia };
    }).filter(rep => rep.distanciaMetros <= 5000); // Radio de 5km en Tuxtla

    // 3. Ordenar por el más cercano
    candidatos.sort((a, b) => a.distanciaMetros - b.distanciaMetros);

    return candidatos.length > 0 ? candidatos[0] : null;
};
