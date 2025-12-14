import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import routes from './routes';
import { errorHandler } from './middleware/errorHandler';

export const createApp = (): Application => {
  const app = express();

  // Trust proxy (nginx)
  app.set('trust proxy', true);

  app.use(helmet());
  app.use(
    cors({
      origin: process.env.ALLOWED_ORIGINS,
      credentials: false,
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.use('/api/admin', routes);

  app.get('/', (req, res) => {
    res.json({ service: 'Bell Streaming Video Metadata Service', version: '1.0.0', status: 'running' });
  });

  app.use(errorHandler);
  return app;
};
