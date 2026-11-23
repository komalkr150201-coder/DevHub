import { Router } from 'express';
import {
  getRequests,
  sendRequest,
  updateRequestStatus,
  cancelRequest,
} from '../controllers/requestController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();

router.get('/', requireAuth, getRequests);
router.post('/', requireAuth, sendRequest);
router.patch('/:id', requireAuth, updateRequestStatus);
router.delete('/:id', requireAuth, cancelRequest);

export default router;
