import express from 'express';
import { register, login, getMe, getDemoAccounts } from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/demo-accounts', getDemoAccounts);

export default router;
