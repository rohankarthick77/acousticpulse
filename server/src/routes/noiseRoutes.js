import { Router } from 'express';
import {
  getNoiseStats,
  getNoiseTrends,
  getHourlyHeatmap,
  getViolations,
  triggerSimulateTick
} from '../controllers/noiseController.js';

const router = Router();

router.get('/stats', getNoiseStats);
router.get('/trends', getNoiseTrends);
router.get('/heatmap', getHourlyHeatmap);
router.get('/violations', getViolations);
router.post('/simulate-tick', triggerSimulateTick);

export default router;
