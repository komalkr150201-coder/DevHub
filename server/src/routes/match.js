import { Router } from 'express';
import { matchDevelopers, searchDevelopers } from '../controllers/matchController.js';
import { optionalAuth } from '../middleware/auth.js';
import { searchLimiter } from '../middleware/rateLimit.js';

const router = Router();

// Rank developers against required + nice-to-have skills
router.post('/match', searchLimiter, optionalAuth, matchDevelopers);

// General developer search by keyword/skills
router.get('/search', searchLimiter, optionalAuth, searchDevelopers);

export default router;
