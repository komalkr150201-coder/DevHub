import { Router } from 'express';
import {
  getCurrentUser,
  updateCurrentUser,
  syncUserData,
  updateRepoStatus,
  updateSkills,
  getPublicProfile,
} from '../controllers/userController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

// Current user routes (protected)
router.get('/me', requireAuth, getCurrentUser);
router.patch('/me', requireAuth, updateCurrentUser);
router.post('/sync', requireAuth, syncUserData);

// Repo customization (pin/hide)
router.patch('/repos/:id', requireAuth, updateRepoStatus);

// Skill customization
router.put('/skills', requireAuth, updateSkills);

// Public profile data
router.get('/users/:username', optionalAuth, getPublicProfile);

export default router;
