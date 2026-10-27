import mongoose from 'mongoose';

/**
 * MongoDB Atlas & Local Database Connection Manager
 * Manages resilient Mongoose connections, event listeners, and clean shutdown.
 */
let isConnected = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI || process.env.MONGO_URI;

  if (!uri) {
    console.error('❌ Neither MONGODB_URI nor MONGO_URI is defined in environment variables.');
    throw new Error('MONGODB_URI/MONGO_URI environment variable missing');
  }

  // Prevent multiple connections
  if (isConnected && mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  // Setup connection event listeners
  mongoose.connection.on('connected', () => {
    isConnected = true;
    const host = mongoose.connection.host;
    const dbName = mongoose.connection.name;
    console.log(`✅ [MongoDB] Successfully connected to: ${host}/${dbName}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error(`❌ [MongoDB] Connection error:`, err.message);
  });

  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.warn(`⚠️ [MongoDB] Disconnected. Waiting for reconnection...`);
  });

  mongoose.connection.on('reconnected', () => {
    isConnected = true;
    console.log(`🔄 [MongoDB] Reconnected successfully.`);
  });

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 8000,
      autoIndex: true, // Build indexes on startup
    });
    return conn;
  } catch (error) {
    console.error(`❌ [MongoDB] Initial connection failed:`, error.message);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  try {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
      isConnected = false;
      console.log('🛑 [MongoDB] Connection closed gracefully.');
    }
  } catch (error) {
    console.error('Error closing MongoDB connection:', error);
  }
}
