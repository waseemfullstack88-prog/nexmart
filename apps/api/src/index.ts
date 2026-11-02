import app from './app';
import { env } from './config/env';
import prisma from './config/database';

async function startServer() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('📦 Connected to PostgreSQL database');

    const server = app.listen(env.port, () => {
      console.log(`🚀 Server running in ${env.nodeEnv} mode on port ${env.port}`);
      console.log(`🔗 API URL: ${env.apiHost}/api`);
    });

    // Graceful shutdown
    const gracefulShutdown = async () => {
      console.log('Closing server and database connections...');
      server.close();
      await prisma.$disconnect();
      process.exit(0);
    };

    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);

  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
