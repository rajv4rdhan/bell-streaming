import { createApp } from './app';
import { connectDatabase, disconnectDatabase } from './database';
import { config } from './config';

const startServer = async (): Promise<void> => {
  try {
    await connectDatabase();
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Video Metadata Service running on port ${config.port}`);
      console.log(`📊 Health: http://localhost:${config.port}/api/health`);
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down...`);
      server.close(async () => {
        await disconnectDatabase();
        process.exit(0);
      });
      setTimeout(() => process.exit(1), 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
