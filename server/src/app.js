import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { config } from './config/env.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/match.js';
import projectRoutes from './routes/projects.js';
import requestRoutes from './routes/requests.js';
import { renderPublicProfileOg } from './controllers/userController.js';
import { notFound, errorHandler } from './middleware/error.js';

const app = express();

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allow inline styles/charts in dev
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration
app.use(
  cors({
    origin: [config.clientUrl, 'http://localhost:5173', 'http://127.0.0.1:5173'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'DevHub API', timestamp: new Date().toISOString() });
});

// Auth Routes
app.use('/auth', authRoutes);

// API Routes
app.use('/api', userRoutes);
app.use('/api', matchRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/requests', requestRoutes);

// Public profile Open Graph endpoint for SEO sharing (/:username)
app.get('/:username', renderPublicProfileOg);

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
