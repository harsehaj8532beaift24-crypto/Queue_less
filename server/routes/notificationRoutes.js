import express from 'express';
import { getMyNotifications, markAsRead, clearAll } from '../controllers/notificationController.js';
import { verifyToken, optionalToken } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', optionalToken, getMyNotifications);
router.patch('/:id/read', verifyToken, markAsRead);
router.delete('/clear', verifyToken, clearAll);

export default router;
