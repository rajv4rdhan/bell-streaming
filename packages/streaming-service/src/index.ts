import dotenv from 'dotenv';
dotenv.config();

import express, { Express, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import videoRoutes from './routes/videoRoutes';
import { rateLimiter } from './middleware/rateLimiter';
import { metricsMiddleware, metricsHandler } from './middleware/metrics';

const app: Express = express();
const port = process.env.PORT || 3003;

app.use(cors({
  origin: 'http://localhost:5173',
  credentials: false,
}));
app.use(helmet());
app.use(express.json());
app.use(rateLimiter);

// Metrics middleware
app.use(metricsMiddleware);

// Metrics endpoint
app.get('/metrics', metricsHandler);

app.get('/', (req: Request, res: Response) => {
  res.send('Streaming Service is running!');
});

app.use('/api/stream', videoRoutes);

// Simple error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!', error: err.message });
});


app.listen(port, () => {
  console.log(`[server]: Streaming service is running at http://localhost:${port}`);
});
