import express from 'express';
import { getBusinessAnalytics } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/overview', getBusinessAnalytics);

export default router;
