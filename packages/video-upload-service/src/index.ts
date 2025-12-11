import { createApp } from './app';
import { config } from './config';
import { uploadMonitor } from './services/uploadMonitor';

const startServer = async (): Promise<void> => {
  try {
    const app = createApp();

    const server = app.listen(config.port, () => {
      console.log(`🚀 Video Upload Service running on port ${config.port}`);
      console.log(`🌍 Environment: ${config.nodeEnv}`);
      console.log(`📊 Health: http://localhost:${config.port}/api/health`);
      console.log(`☁️  S3 Bucket: ${config.aws.s3BucketName}`);
      
      // Start upload monitoring
      uploadMonitor.start();
    });

    const gracefulShutdown = async (signal: string) => {
      console.log(`\n${signal} received. Shutting down...`);
      uploadMonitor.stop();
      server.close(() => {
        console.log('✅ Graceful shutdown completed');
        process.exit(0);
      });
      setTimeout(() => {
        console.error('⚠️  Forcing shutdown after timeout');
        process.exit(1);
      }, 10000);
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
