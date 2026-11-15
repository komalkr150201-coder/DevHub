import { Router } from 'express';
import {
  getRequests,
  sendRequest,
  updateRequestStatus,
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getRequests);
router.post('/', requireAuth, sendRequest);
router.patch('/:id', requireAuth, updateRequestStatus);

export default router;
