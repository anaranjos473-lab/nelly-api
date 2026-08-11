import { workerData, parentPort } from 'worker_threads';
import { FULFILLMENT_NODE_STATES } from '../domain/index.js';

const calcularDistancia = (lat1, lon1, lat2, lon2) => {
	const R = 6371; // Radio Tierra km
	const dLat = (lat2 - lat1) * Math.PI / 180;
	const dLon = (lon2 - lon1) * Math.PI / 180;
	const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
			  Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
			  Math.sin(dLon / 2) * Math.sin(dLon / 2);
	const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
	return R * c;
};

const encontrarMejorConductor = (origen, conductores) => {
	let mejor = null;
	let minD = Infinity;

	const entries = Array.isArray(conductores)
		? conductores.map((driver) => [driver?.id, driver]).filter(([id, datos]) => Boolean(id) && datos)
		: Object.entries(conductores || {});

	for (const [id, datos] of entries) {
		if (!id || !datos) continue;
		if (datos.estado !== FULFILLMENT_NODE_STATES.DISPONIBLE) continue;
		const d = calcularDistancia(origen.lat, origen.lng, datos.lat, datos.lng);
		if (d < minD && d <= 5.0) { // Radio de 5km en Tuxtla
			minD = d;
			mejor = { id, distancia: d };
		}
	}
	return mejor;
};

if (parentPort && workerData) {
	const { origen, conductores, driversSnapshot } = workerData;
	parentPort.postMessage(encontrarMejorConductor(origen, driversSnapshot || conductores || {}));
}

export {
	calcularDistancia,
	encontrarMejorConductor
};
