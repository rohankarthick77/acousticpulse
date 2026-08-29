import { Router } from 'express';
import { getUsers, updateUserRole } from '../controllers/userController.js';
import { authenticate, authorizeRoles } from '../middleware/auth.js';

const router = Router();

router.get('/', authenticate, authorizeRoles('ADMIN'), getUsers);
router.put('/:id', authenticate, authorizeRoles('ADMIN'), updateUserRole);

export default router;
