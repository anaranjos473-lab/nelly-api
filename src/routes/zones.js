import { Router } from 'express';
import { getZonas } from '../controllers/zonesController.js';
import { authenticateJWT } from '../middlewares/auth.js';

const router = Router();

router.get('/', authenticateJWT, getZonas);

export default router;
