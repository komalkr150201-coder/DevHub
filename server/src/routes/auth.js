import { Router } from 'express';
import {
  initiateGitHubAuth,
  handleGitHubCallback,
  demoLogin,
  logout,
} from '../controllers/authController.js';
import { authLimiter } from '../middleware/rateLimit.js';

const router = Router();

router.get('/github', authLimiter, initiateGitHubAuth);
router.get('/github/callback', handleGitHubCallback);
router.post('/demo-login', authLimiter, demoLogin);
router.post('/logout', logout);

export default router;
