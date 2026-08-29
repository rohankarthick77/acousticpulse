import { Router } from 'express';
import {
  getStations,
  getStationById,
  createStation,
  updateStation,
  deleteStation
} from '../controllers/stationController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Publicly visible or optional auth
router.get('/', getStations);
router.get('/:id', getStationById);

// Admin / Authority mutations
router.post('/', authenticate, authorizeRoles('ADMIN'), createStation);
router.put('/:id', authenticate, authorizeRoles('ADMIN', 'AUTHORITY'), updateStation);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteStation);

export default router;
