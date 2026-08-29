import { Router } from 'express';
import { getAcousticProfiles } from '../controllers/profileController.js';

const router = Router();

router.get('/', getAcousticProfiles);

export default router;
