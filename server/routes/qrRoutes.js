import express from 'express';
import { verifyQR, publicViewToken, executeQueueAction } from '../controllers/qrController.js';
import { optionalToken, verifyToken, requireRole } from '../middleware/auth.js';

const router = express.Router();

// Verify QR code or token reference (Staff In-App Camera Scanner / Manual Lookup)
router.post('/verify', optionalToken, verifyQR);

// Public View for smartphone cameras scanning the QR code
router.get('/view', publicViewToken);
router.get('/view/:ref', publicViewToken);

// Execute Queue Action after verified scan (Call, Serve, Complete, Skip)
router.post('/action', optionalToken, executeQueueAction);

export default router;
