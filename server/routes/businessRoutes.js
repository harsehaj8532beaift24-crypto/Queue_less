import express from 'express';
import {
  getAllBusinesses,
  getBusinessById,
  createBusiness,
  updateBusiness,
} from '../controllers/businessController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getAllBusinesses);
router.get('/:id', getBusinessById);
router.post('/', verifyToken, requireRole('admin'), createBusiness);
router.patch('/:id', verifyToken, requireRole('admin', 'staff'), updateBusiness);

export default router;
