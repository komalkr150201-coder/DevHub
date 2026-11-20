import { Router } from 'express';
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  demoLogin,
  logout,
  register,
  login,
  getCurrentUser,
  fetchGitHubUser,
  getRealDevelopers,
  forgotPassword,
  resetPassword,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Registration & Standard Login
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);
router.get('/me', getCurrentUser);

// Password recovery
router.post('/forgot-password', authLimiter, forgotPassword);
router.post('/reset-password', authLimiter, resetPassword);

// GitHub Dynamic User Inspection & Real Developers Directory
router.post('/fetch-github-user', fetchGitHubUser);
router.get('/real-developers', getRealDevelopers);

// GitHub OAuth
router.get('/github', authLimiter, initiateGitHubAuth);
router.get('/github/callback', handleGitHubCallback);

// Demo & Logout
router.post('/demo-login', authLimiter, demoLogin);
router.post('/logout', logout);

export default router;
