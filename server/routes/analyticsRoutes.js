import express from 'express';
import { getBusinessAnalytics, getPlatformAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/overview', getBusinessAnalytics);
router.get('/platform', getPlatformAnalytics);

export default router;
