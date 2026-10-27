import express from 'express';
import {
  getQueues,
  getQueueStatus,
  joinQueue,
  callNext,
  updateQueueCounters,
} from '../controllers/queueController.js';
import { verifyToken, optionalToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQueues);
router.get('/:queueId/status', getQueueStatus);
router.post('/:queueId/join', optionalToken, joinQueue);
router.post('/:queueId/next', verifyToken, requireRole('staff', 'admin'), callNext);
router.patch('/:queueId/counters', verifyToken, requireRole('staff', 'admin'), updateQueueCounters);

export default router;
