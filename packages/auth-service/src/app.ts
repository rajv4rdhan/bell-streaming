import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { config } from './config';
import routes from './routes';
import { errorHandler } from './middleware';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy (nginx)
  app.set('trust proxy', true);

  // Security middleware
  app.use(helmet());

  // CORS configuration
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS?.split(',') || config.cors.allowedOrigins,
      credentials: true,
    })
  );

  // Body parsing middleware
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // Metrics middleware
  app.use(metricsMiddleware);

  // Metrics endpoint
  app.get('/metrics', metricsHandler);

  // Routes
  app.use('/api', routes);

  // Root endpoint
  app.get('/', (req, res) => {
    res.json({
      service: 'Bell Streaming Auth Service',
      version: '1.0.0',
      status: 'running',
    });
  });

  // Error handling middleware (must be last)
  app.use(errorHandler);

  return app;
};
