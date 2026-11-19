import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { config } from './config/env.js';

import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import matchRoutes from './routes/match.js';
import projectRoutes from './routes/projects.js';
import requestRoutes from './routes/requests.js';
import notificationRoutes from "./routes/notifications.js";
import { renderPublicProfileOg } from './controllers/userController.js';
import { notFound, errorHandler } from './middleware/error.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.resolve(__dirname, '../../client/dist');

const app = express();

// Trust reverse proxies (Render, Vercel, Railway, Cloudflare, AWS) for secure HTTPS cookies
app.set('trust proxy', 1);

// Security HTTP headers
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows inline SVG / charts
    crossOriginEmbedderPolicy: false,
  })
);

// Dynamic CORS configuration supporting local dev & production origins
const allowedOrigins = [
  config.clientUrl,
  'http://localhost:5173',
  'http://localhost:5001',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:5001',
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, or same-origin static assets)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        origin.endsWith('.vercel.app') ||
        origin.endsWith('.onrender.com') ||
        origin.endsWith('.railway.app') ||
        origin.endsWith('.netlify.app')
      ) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Request parsing with 10mb limit for base64 avatar uploads
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

if (config.env !== 'test') {
  app.use(morgan('dev'));
}

// Serve frontend static build in production or when client/dist exists
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
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
app.use("/api/notifications", notificationRoutes);

// Public profile Open Graph endpoint for SEO sharing (/:username)
app.get('/:username', renderPublicProfileOg);

// Client SPA fallback: serve index.html for frontend routes in unified deployment
if (fs.existsSync(clientDistPath)) {
  app.get(['/', '/login', '/signup', '/app', '/app/*', '/u/:username', '/profile/:username'], (req, res) => {
    res.sendFile(path.join(clientDistPath, 'index.html'));
  });
}

// Error handlers
app.use(notFound);
app.use(errorHandler);

export default app;
