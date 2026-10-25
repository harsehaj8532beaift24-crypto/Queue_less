import express from 'express';
import {
  register,
  login,
  logout,
  getMe,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
  getDemoAccounts,
} from '../controllers/authController.js';
import { verifyToken } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', verifyToken, getMe);
router.patch('/profile', verifyToken, updateProfile);
router.post('/change-password', verifyToken, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);
router.get('/demo-accounts', getDemoAccounts);

export default router;
