import app from './app.js';
import { connectDB } from './config/db.js';
import { config } from './config/env.js';
import { startSyncJob } from './jobs/syncJob.js';
import { seedDatabase } from './seed.js';
import { User } from './models/User.js';

const startServer = async () => {
  try {
    await connectDB();

    // Auto-seed if database is currently empty
    const userCount = await User.countDocuments();
    if (userCount === 0) {
      console.log('🌱 Database is empty. Seeding initial verified developers and projects...');
      await seedDatabase();
    }

    startSyncJob();

    const server = app.listen(config.port, () => {
      console.log(`\n=================================================`);
      console.log(`🚀 DevHub Server running on http://localhost:${config.port}`);
      console.log(`🌐 Client URL: ${config.clientUrl}`);
      console.log(`📦 Environment: ${config.env}`);
      console.log(`=================================================\n`);
    });

    const shutdown = () => {
      console.log('\nShutting down server gracefully...');
      server.close(() => {
        console.log('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (err) {
    console.error('Fatal error starting server:', err);
    process.exit(1);
  }
};

startServer();
