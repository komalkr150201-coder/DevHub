import { Router } from 'express';
import {
  getProjects,
  createProject,
  getProjectById,
  getProjectMatches,
  updateProject,
  deleteProject,
} from '../controllers/projectController.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', optionalAuth, getProjects);
router.post('/', requireAuth, createProject);
router.get('/:id', optionalAuth, getProjectById);
router.get('/:id/matches', requireAuth, getProjectMatches);
router.patch('/:id', requireAuth, updateProject);
router.delete('/:id', requireAuth, deleteProject);

export default router;
