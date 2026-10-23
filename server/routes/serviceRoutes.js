import express from 'express';
import { getServicesByBusiness, createService } from '../controllers/serviceController.js';
import { verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/business/:businessId', getServicesByBusiness);
router.post('/', verifyToken, requireRole('admin', 'staff'), createService);

export default router;
