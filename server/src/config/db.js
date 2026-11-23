import mongoose from 'mongoose';
import { config } from './env.js';

let mongodInstance = null;

export const connectDB = async () => {
  try {
    // Attempt connecting to the configured MONGO_URI with a 2-second timeout
    const options = {
      serverSelectionTimeoutMS: 2500,
    };

    try {
      console.log(`Connecting to MongoDB at: ${config.mongoUri}...`);
      await mongoose.connect(config.mongoUri, options);
      console.log('✅ Connected to MongoDB successfully.');
      return;
    } catch (primaryErr) {
      console.warn(`⚠️ Could not connect to primary MongoDB (${primaryErr.message}).`);
      console.log('🔄 Initializing in-memory MongoDB fallback for zero-config development...');

      // Fallback: Use MongoMemoryServer
      const { MongoMemoryServer } = await import('mongodb-memory-server');
      mongodInstance = await MongoMemoryServer.create();
      const inMemoryUri = mongodInstance.getUri();
      console.log(`🚀 In-Memory MongoDB running at: ${inMemoryUri}`);

      await mongoose.connect(inMemoryUri);
      console.log('✅ Connected to In-Memory MongoDB successfully.');
    }
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};

export const closeDB = async () => {
  try {
    await mongoose.connection.close();
    if (mongodInstance) {
      await mongodInstance.stop();
    }
    console.log('MongoDB connection closed.');
  } catch (err) {
    console.error('Error closing MongoDB connection:', err);
  }
};
