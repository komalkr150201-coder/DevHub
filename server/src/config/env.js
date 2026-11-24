import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from server directory or root
dotenv.config({ path: path.resolve(__dirname, '../../.env') });
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });

const port = parseInt(process.env.PORT, 10) || 5001;
const rawMongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/devhub';
// Normalize database name casing to prevent macOS WiredTiger code 13297 case conflicts
const mongoUri = rawMongoUri.replace(/\/devhub(\?|$)/i, '/devhub$1');

export const config = {
  env: process.env.NODE_ENV || 'development',
  port,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  mongoUri,
  jwtSecret: process.env.JWT_SECRET || 'devhub_super_secret_jwt_key_at_least_32_characters_long_2026',
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || '7d',
  encryptionKey: process.env.ENCRYPTION_KEY || 'devhub_secret_aes_key_32_chars_ok',
  github: {
    clientId: process.env.GITHUB_CLIENT_ID || '',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || '',
    callbackUrl: process.env.GITHUB_CALLBACK_URL || `http://localhost:${port}/auth/github/callback`,
    scopes: ['read:user', 'user:email', 'public_repo'],
  },
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
  },
  publicBaseUrl:
    process.env.PORTFOLIO_PUBLIC_URL ||
    (process.env.CLIENT_URL && !process.env.CLIENT_URL.includes('localhost') && !process.env.CLIENT_URL.includes('127.0.0.1') ? process.env.CLIENT_URL : '') ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : ''),
  syncIntervalHours: parseInt(process.env.SYNC_INTERVAL_HOURS, 10) || 6,
};
