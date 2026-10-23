import jwt from 'jsonwebtoken';
import User from '../models/User.js';

function generateToken(user) {
  const secret = process.env.JWT_SECRET || 'queueless_secret_dev_key';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign(
    {
      id: user._id,
      email: user.email,
      role: user.role,
    },
    secret,
    { expiresIn }
  );
}

/**
 * Register a new user
 * POST /api/auth/register
 */
export async function register(req, res, next) {
  try {
    const { name, email, password, role = 'customer', phone } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Name, email, and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email already exists',
      });
    }

    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: ['customer', 'staff', 'admin'].includes(role) ? role : 'customer',
      phone: phone ? phone.trim() : '',
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      data: {
        user,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Log in existing user
 * POST /api/auth/login
 */
export async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      data: {
        user: user.toJSON(),
        token,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get currently authenticated user
 * GET /api/auth/me
 */
export async function getMe(req, res, next) {
  try {
    res.status(200).json({
      success: true,
      data: {
        user: req.user,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * Get Demo accounts for coursework review
 * GET /api/auth/demo-accounts
 */
export async function getDemoAccounts(req, res) {
  res.status(200).json({
    success: true,
    data: [
      {
        role: 'Customer',
        email: 'customer@queueless.com',
        password: 'password123',
        description: 'Customer account to book tokens and test live notifications',
      },
      {
        role: 'Staff',
        email: 'staff@queueless.com',
        password: 'password123',
        description: 'Staff account to manage desk queues, call tokens, and scan QR codes',
      },
      {
        role: 'Admin',
        email: 'admin@queueless.com',
        password: 'password123',
        description: 'Administrator account with full access to venues, analytics, and controls',
      },
    ],
  });
}
