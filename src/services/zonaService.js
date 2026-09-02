import { getAdmin } from '../../config/firebase-admin-esm.js';

export const ZONE_CONTRACT_VERSION = 'zona-v1';
const ZONE_KEYS = new Set(['id', 'nombre', 'colorHex', 'coordenadas']);
const ID_PATTERN = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;

export class ZonaServiceError extends Error {
    constructor(code, message, status = 500, details = []) {
        super(message);
        this.name = 'ZonaServiceError';
        this.code = code;
        this.status = status;
        this.details = details;
    }
}

function invalid(details) {
    return new ZonaServiceError('ZONE_INVALID', 'La zona no cumple el contrato Zona v1', 400, details);
}

function isFiniteCoordinate(value) {
    return typeof value === 'number' && Number.isFinite(value);
}

function orientation(a, b, c) {
    return (b.lng - a.lng) * (c.lat - a.lat) - (b.lat - a.lat) * (c.lng - a.lng);
}

function onSegment(a, b, c) {
    return Math.min(a.lng, c.lng) <= b.lng && b.lng <= Math.max(a.lng, c.lng)
        && Math.min(a.lat, c.lat) <= b.lat && b.lat <= Math.max(a.lat, c.lat);
}

function segmentsIntersect(a, b, c, d) {
    const abC = orientation(a, b, c);
    const abD = orientation(a, b, d);
    const cdA = orientation(c, d, a);
    const cdB = orientation(c, d, b);
    const epsilon = 1e-12;

    if (Math.abs(abC) <= epsilon && onSegment(a, c, b)) return true;
    if (Math.abs(abD) <= epsilon && onSegment(a, d, b)) return true;
    if (Math.abs(cdA) <= epsilon && onSegment(c, a, d)) return true;
    if (Math.abs(cdB) <= epsilon && onSegment(c, b, d)) return true;
    return (abC > epsilon) !== (abD > epsilon) && (cdA > epsilon) !== (cdB > epsilon);
}

function validateGeometry(coordenadas, errors) {
    for (let i = 0; i < coordenadas.length; i += 1) {
        const point = coordenadas[i];
        if (!point || !isFiniteCoordinate(point.lat) || !isFiniteCoordinate(point.lng)) {
            errors.push(`coordenadas[${i}] debe tener lat/lng numericos y finitos`);
        } else {
            if (point.lat < -90 || point.lat > 90) errors.push(`coordenadas[${i}].lat fuera de rango`);
            if (point.lng < -180 || point.lng > 180) errors.push(`coordenadas[${i}].lng fuera de rango`);
        }
    }
    if (errors.length > 0) return;

    const seen = new Set();
    for (const point of coordenadas) {
        const key = `${point.lat},${point.lng}`;
        if (seen.has(key)) errors.push('coordenadas no puede contener vertices duplicados');
        seen.add(key);
    }

    let area = 0;
    for (let i = 0; i < coordenadas.length; i += 1) {
        const current = coordenadas[i];
        const next = coordenadas[(i + 1) % coordenadas.length];
        area += current.lng * next.lat - next.lng * current.lat;
    }
    if (Math.abs(area) <= 1e-12) errors.push('coordenadas debe formar un poligono no degenerado');

    for (let i = 0; i < coordenadas.length; i += 1) {
        const a = coordenadas[i];
        const b = coordenadas[(i + 1) % coordenadas.length];
        for (let j = i + 1; j < coordenadas.length; j += 1) {
            if (j === i || j === i + 1 || (i === 0 && j === coordenadas.length - 1)) continue;
            const c = coordenadas[j];
            const d = coordenadas[(j + 1) % coordenadas.length];
            if (segmentsIntersect(a, b, c, d)) errors.push('coordenadas no puede tener autointersecciones');
        }
    }
}

export function normalizeZoneId(value) {
    return String(value ?? '').trim().toLowerCase();
}

export function validateZonaV1(payload, { expectedId } = {}) {
    const errors = [];
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
        throw invalid(['El cuerpo debe ser un objeto']);
    }

    for (const key of Object.keys(payload)) {
        if (!ZONE_KEYS.has(key)) errors.push(`Campo desconocido: ${key}`);
    }

    const id = normalizeZoneId(expectedId ?? payload.id);
    if (!id) errors.push('id es obligatorio');
    else if (!ID_PATTERN.test(id) || String(expectedId ?? payload.id).trim() !== id) errors.push('id debe estar normalizado');
    if (expectedId !== undefined && payload.id !== undefined && normalizeZoneId(payload.id) !== normalizeZoneId(expectedId)) {
        errors.push('id del body no coincide con el id de la URL');
    }

    const nombre = typeof payload.nombre === 'string' ? payload.nombre.trim() : '';
    if (!nombre) errors.push('nombre es obligatorio');
    if (typeof payload.colorHex !== 'string' || !/^#[0-9A-Fa-f]{6}$/.test(payload.colorHex)) errors.push('colorHex debe tener formato #RRGGBB');
    if (!Array.isArray(payload.coordenadas) || payload.coordenadas.length < 3) errors.push('coordenadas requiere al menos 3 vertices');
    else validateGeometry(payload.coordenadas, errors);
    if (errors.length > 0) throw invalid(errors);

    return {
        id,
        nombre,
        colorHex: payload.colorHex.toUpperCase(),
        coordenadas: payload.coordenadas.map(({ lat, lng }) => ({ lat, lng }))
    };
}

function zonesCollection(admin) {
    return admin.firestore().collection('configuracion').doc('zonas').collection('items');
}

function storageError(error) {
    if (error instanceof ZonaServiceError) return error;
    return new ZonaServiceError('ZONE_STORAGE_ERROR', 'No se pudo acceder al almacenamiento de zonas', 500);
}

export async function createZone(payload) {
    const zone = validateZonaV1(payload);
    try {
        const collection = zonesCollection(await getAdmin());
        await collection.doc(zone.id).create(zone);
        return zone;
    } catch (error) {
        if (error?.code === 6 || error?.code === 'already-exists') throw new ZonaServiceError('ZONE_ID_EXISTS', 'La zona ya existe', 409);
        throw storageError(error);
    }
}

export async function listZones() {
    try {
        const snapshot = await zonesCollection(await getAdmin()).get();
        return snapshot.docs.map((doc) => {
            try { return validateZonaV1({ ...doc.data(), id: doc.id }); } catch { return null; }
        }).filter(Boolean);
    } catch (error) {
        throw storageError(error);
    }
}

export async function getZone(id) {
    const normalizedId = normalizeZoneId(id);
    if (!normalizedId) throw new ZonaServiceError('ZONE_NOT_FOUND', 'Zona no encontrada', 404);
    try {
        const doc = await zonesCollection(await getAdmin()).doc(normalizedId).get();
        if (!doc.exists) throw new ZonaServiceError('ZONE_NOT_FOUND', 'Zona no encontrada', 404);
        return validateZonaV1({ ...doc.data(), id: doc.id });
    } catch (error) {
        throw storageError(error);
    }
}

export async function updateZone(id, payload) {
    const zone = validateZonaV1(payload, { expectedId: id });
    try {
        const doc = zonesCollection(await getAdmin()).doc(zone.id);
        const current = await doc.get();
        if (!current.exists) throw new ZonaServiceError('ZONE_NOT_FOUND', 'Zona no encontrada', 404);
        await doc.set(zone);
        return zone;
    } catch (error) {
        throw storageError(error);
    }
}

export async function deleteZone(id) {
    const normalizedId = normalizeZoneId(id);
    if (!normalizedId) throw new ZonaServiceError('ZONE_NOT_FOUND', 'Zona no encontrada', 404);
    try {
        const doc = zonesCollection(await getAdmin()).doc(normalizedId);
        const current = await doc.get();
        if (!current.exists) throw new ZonaServiceError('ZONE_NOT_FOUND', 'Zona no encontrada', 404);
        await doc.delete();
        return { id: normalizedId };
    } catch (error) {
        throw storageError(error);
    }
}
