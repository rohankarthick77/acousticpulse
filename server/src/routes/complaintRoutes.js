import { Router } from 'express';
import {
  getComplaints,
  getComplaintByIdOrTracking,
  createComplaint,
  updateComplaintStatus,
  deleteComplaint
} from '../controllers/complaintController.js';
import { authenticate, optionalAuth, authorizeRoles } from '../middleware/auth.js';

const router = Router();

// Public / Citizen
router.get('/', optionalAuth, getComplaints);
router.get('/:identifier', optionalAuth, getComplaintByIdOrTracking);
router.post('/', optionalAuth, createComplaint);

// Authority / Admin
router.put('/:id/status', authenticate, authorizeRoles('ADMIN', 'AUTHORITY'), updateComplaintStatus);
router.delete('/:id', authenticate, authorizeRoles('ADMIN'), deleteComplaint);

export default router;
