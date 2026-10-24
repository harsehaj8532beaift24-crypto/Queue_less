import http from 'http';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import { connectDB, closeDatabaseConnection } from './config/db.js';
import { initSocket } from './services/socketService.js';
import { errorHandler } from './middleware/errorHandler.js';

// Route Imports
import authRoutes from './routes/authRoutes.js';
import businessRoutes from './routes/businessRoutes.js';
import serviceRoutes from './routes/serviceRoutes.js';
import queueRoutes from './routes/queueRoutes.js';
import tokenRoutes from './routes/tokenRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import notificationRoutes from './routes/notificationRoutes.js';

import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

// Middleware
app.use(
  cors({
    origin: [CLIENT_URL, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const states = ['Disconnected', 'Connected', 'Connecting', 'Disconnecting'];
  res.status(200).json({
    status: 'ok',
    service: 'QueueLess API',
    database: states[dbState] || 'Unknown',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/businesses', businessRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/queues', queueRoutes);
app.use('/api/tokens', tokenRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/notifications', notificationRoutes);

// Catch-all for undefined routes
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found on endpoint: ${req.method} ${req.originalUrl}`,
  });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

// Create HTTP server & attach Socket.IO
const server = http.createServer(app);
initSocket(server, CLIENT_URL);

// Server startup: Connect to MongoDB first, then listen
async function startServer() {
  try {
    console.log('⏳ Connecting to MongoDB...');
    await connectDB();

    server.listen(PORT, () => {
      console.log(`🚀 [Server] QueueLess API running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
      console.log(`🔗 [API Health] http://localhost:${PORT}/api/health`);
    });
  } catch (error) {
    console.error('❌ Failed to start QueueLess server due to database connection error:', error.message);
    process.exit(1);
  }
}

// Graceful Termination Handlers
async function gracefulShutdown(signal) {
  console.log(`\n🛑 Received ${signal}. Shutting down QueueLess server gracefully...`);
  server.close(async () => {
    console.log('🔌 HTTP and WebSocket servers closed.');
    await closeDatabaseConnection();
    process.exit(0);
  });

  // Force shutdown after 10s timeout
  setTimeout(() => {
    console.error('⚠️ Could not close connections in time, forcefully shutting down.');
    process.exit(1);
  }, 10000);
}

process.on('SIGINT', () => gracefulShutdown('SIGINT'));
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));

startServer();

export { app, server };
