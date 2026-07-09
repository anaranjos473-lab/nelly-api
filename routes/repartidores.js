import express from 'express';
import admin from 'firebase-admin';

const router = express.Router();

const normalizeDriverCode = (value) => {
    if (value == null) return null;
    const normalized = String(value).trim();
    return normalized || null;
};

const canSetDriverCode = (existingCodigo, requestedCodigo) => {
    if (!requestedCodigo) {
        return true;
    }
    if (!existingCodigo) {
        return true;
    }
    return existingCodigo === requestedCodigo;
};

const buildDriverPresentacion = (uid, driver = {}, activeData = {}) => ({
    uid,
    codigo: normalizeDriverCode(driver.codigo || driver.numero || driver.alias || driver.alias_conductor),
    nombre: driver.nombre || driver.displayName || driver.name || null,
    disponible: driver.disponible === true || ['ONLINE', 'LISTO', 'DISPONIBLE', 'EN_CURSO'].includes(String(driver.estado || '').toUpperCase()),
    pedido_activo: driver.pedido_activo || null,
    ultima_conexion: driver.ultima_conexion || null,
    ubicacion: driver.ubicacion || null,
    activo: Boolean(activeData && Object.keys(activeData).length > 0),
    activoData: activeData || {}
});

/**
 * PATCH /api/repartidores/estado
 * Actualiza la disponibilidad y ubicación del repartidor
 */
router.patch('/estado', async (req, res) => {
    const { uid, disponible, lat, lng, bateria } = req.body;
    const codigo = normalizeDriverCode(req.body.codigo || req.body.alias || req.body.numero);
    try {
        const db = admin.database();
        const repartidorRef = db.ref(`repartidores/${uid}`);
        const currentSnap = await repartidorRef.once('value');
        const currentDriver = currentSnap.val() || {};

        if (!canSetDriverCode(currentDriver.codigo, codigo)) {
            return res.status(409).json({ success: false, error: 'El codigo ya fue establecido y no puede modificarse' });
        }

        const updates = {
            disponible,
            ultima_conexion: admin.database.ServerValue.TIMESTAMP,
            ubicacion: { lat, lng },
            meta: { bateria: bateria || 100 }
        };
        if (codigo && !currentDriver.codigo) {
            updates.codigo = codigo;
        }

        await repartidorRef.update(updates);

        res.status(200).json({ success: true, message: "Estado de Nelly Repartidor actualizado" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
});

// Endpoint raíz para el monitor
router.get('/', (req, res) => {
    res.status(200).json({ 
        success: true, 
        profile: { displayName: "Repartidor Nelly", status: "online" } 
    });
});

// Endpoint para cerrar turno
router.post('/cerrar-turno', async (req, res) => {
    try {
        const { repartidorId } = req.body;
        if (!repartidorId) return res.status(400).send({ error: "Falta repartidorId" });

        res.status(200).send({ 
            status: "Success",
            message: "Turno cerrado correctamente"
        });
    } catch (error) {
        res.status(500).send({ error: "Error interno" });
    }
});

router.get('/available', async (req, res) => {
    try {
        const db = admin.database();
        const [repartidoresActivosSnap, conductoresActivosSnap] = await Promise.all([
            db.ref('repartidores_activos').once('value'),
            db.ref('conductores_activos').once('value')
        ]);

        const repartidoresActivos = repartidoresActivosSnap.val() || {};
        const conductoresActivos = conductoresActivosSnap.val() || {};
        const uids = new Set([
            ...Object.keys(repartidoresActivos),
            ...Object.keys(conductoresActivos)
        ]);

        const drivers = await Promise.all(Array.from(uids).map(async (uid) => {
            const driverSnap = await db.ref(`repartidores/${uid}`).once('value');
            const driver = driverSnap.val() || {};
            return buildDriverPresentacion(uid, driver, repartidoresActivos[uid] || conductoresActivos[uid] || {});
        }));

        return res.status(200).json({ success: true, total: drivers.length, drivers });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.patch('/:uid/codigo', async (req, res) => {
    const uid = String(req.params.uid || '').trim();
    const codigo = normalizeDriverCode(req.body.codigo || req.body.alias || req.body.numero);
    if (!uid) {
        return res.status(400).json({ success: false, error: 'UID de repartidor es requerido' });
    }
    if (!codigo) {
        return res.status(400).json({ success: false, error: 'Codigo de repartidor es requerido' });
    }

    try {
        const db = admin.database();
        const repartidorSnap = await db.ref(`repartidores/${uid}`).once('value');
        const repartidor = repartidorSnap.val() || {};
        const currentCodigo = normalizeDriverCode(repartidor.codigo);

        if (!canSetDriverCode(currentCodigo, codigo)) {
            return res.status(409).json({ success: false, error: 'El codigo ya fue establecido y no puede modificarse' });
        }
        if (currentCodigo === codigo) {
            return res.status(200).json({ success: true, uid, codigo, message: 'Codigo ya establecido' });
        }

        await db.ref(`repartidores/${uid}`).update({ codigo });
        return res.status(200).json({ success: true, uid, codigo });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

export default router;