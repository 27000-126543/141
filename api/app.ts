import express, {
  type Request,
  type Response,
} from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import teamRoutes from './routes/team.js';
import hackRoutes from './routes/hack.js';
import marketRoutes from './routes/market.js';
import stormRoutes from './routes/storm.js';
import reportRoutes from './routes/report.js';

dotenv.config();

const app: express.Application = express();

app.use(cors({
  origin: process.env.CLIENT_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/team', teamRoutes);
app.use('/api/hack', hackRoutes);
app.use('/api/market', marketRoutes);
app.use('/api/storm', stormRoutes);
app.use('/api', reportRoutes);

app.use(
  '/api/health',
  (req: Request, res: Response): void => {
    res.status(200).json({
      success: true,
      message: 'ok',
    });
  },
);

app.use((error: Error, req: Request, res: Response) => {
  console.error('Error:', error);
  res.status(500).json({
    success: false,
    error: 'Server internal error',
    message: error.message,
  });
});

app.use((req: Request, res: Response) => {
  res.status(404).json({
    success: false,
    error: 'API not found',
    message: `Cannot ${req.method} ${req.path}`,
  });
});

export default app;
