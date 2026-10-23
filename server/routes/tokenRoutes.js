import express from 'express';
import {
  getMyTokens,
  getBusinessTokens,
  getTokenById,
  cancelToken,
  pushBack,
  changeTokenStatus,
  verifyTokenQR,
} from '../controllers/tokenController.js';
import { verifyToken, optionalToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

router.get('/my', optionalToken, getMyTokens);
router.get('/business/:businessId', verifyToken, requireRole('staff', 'admin'), getBusinessTokens);
router.get('/:tokenId', getTokenById);
router.patch('/:tokenId/cancel', optionalToken, cancelToken);
router.patch('/:tokenId/pushback', pushBack);
router.patch('/:tokenId/status', verifyToken, requireRole('staff', 'admin'), changeTokenStatus);
router.post('/verify-qr', verifyTokenQR);

export default router;
