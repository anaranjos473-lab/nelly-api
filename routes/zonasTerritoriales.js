import express from 'express';
import { listZones, ZonaServiceError, ZONE_CONTRACT_VERSION } from '../src/services/zonaService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        return res.json({ ok: true, contract_version: ZONE_CONTRACT_VERSION, zonas: await listZones() });
    } catch (error) {
        if (error instanceof ZonaServiceError) return res.status(error.status).json({ ok: false, error: error.code, message: error.message });
        return next(error);
    }
});

export default router;
