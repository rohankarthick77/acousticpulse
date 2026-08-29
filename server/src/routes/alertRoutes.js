import { Router } from 'express';
import { getAlerts, getAlertStats, resolveAlert } from '../controllers/alertController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', getAlerts);
router.get('/stats', getAlertStats);
router.put('/:id/resolve', authenticate, authorizeRoles('ADMIN', 'AUTHORITY'), resolveAlert);

export default router;
