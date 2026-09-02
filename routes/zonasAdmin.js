import express from 'express';
import { getZone, listZones, createZone, updateZone, deleteZone, ZonaServiceError, ZONE_CONTRACT_VERSION } from '../src/services/zonaService.js';
import { requirePanelAdminEmailAuth } from './admin.js';

const router = express.Router();

function sendError(res, error) {
    const normalized = error instanceof ZonaServiceError ? error : new ZonaServiceError('ZONE_STORAGE_ERROR', 'No se pudo procesar la zona');
    return res.status(normalized.status).json({ ok: false, error: normalized.code, message: normalized.message, ...(normalized.details.length ? { details: normalized.details } : {}) });
}

router.post('/', requirePanelAdminEmailAuth, async (req, res) => {
    try { return res.status(201).json({ ok: true, zona: await createZone(req.body) }); } catch (error) { return sendError(res, error); }
});
router.get('/', requirePanelAdminEmailAuth, async (req, res) => {
    try { return res.json({ ok: true, contract_version: ZONE_CONTRACT_VERSION, zonas: await listZones() }); } catch (error) { return sendError(res, error); }
});
router.get('/:id', requirePanelAdminEmailAuth, async (req, res) => {
    try { return res.json({ ok: true, zona: await getZone(req.params.id) }); } catch (error) { return sendError(res, error); }
});
router.put('/:id', requirePanelAdminEmailAuth, async (req, res) => {
    try { return res.json({ ok: true, zona: await updateZone(req.params.id, req.body) }); } catch (error) { return sendError(res, error); }
});
router.delete('/:id', requirePanelAdminEmailAuth, async (req, res) => {
    try { return res.json({ ok: true, ...await deleteZone(req.params.id) }); } catch (error) { return sendError(res, error); }
});

export default router;
