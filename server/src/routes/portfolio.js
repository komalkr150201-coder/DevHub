import { Router } from 'express';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import {
  getMyPortfolio, getGitHubBackground, updateMyPortfolio, generatePortfolio, regenerateSection, previewPortfolio,
  downloadZip, checkSlug, publishPortfolio, unpublishPortfolio, listVersions, restoreVersion, getNetworkInfo,
} from '../controllers/portfolioController.js';

const router = Router();

router.get('/', requireAuth, getMyPortfolio);
router.get('/network-info', requireAuth, getNetworkInfo);
router.get('/github-background', requireAuth, getGitHubBackground);
router.put('/', requireAuth, updateMyPortfolio);
router.post('/generate', requireAuth, aiLimiter, generatePortfolio);
router.post('/regenerate', requireAuth, aiLimiter, regenerateSection);
router.post('/preview', requireAuth, previewPortfolio);
router.get('/export', optionalAuth, downloadZip);
router.get('/slug-check', checkSlug);
router.post('/publish', requireAuth, publishPortfolio);
router.post('/unpublish', requireAuth, unpublishPortfolio);
router.get('/versions', requireAuth, listVersions);
router.post('/versions/:versionId/restore', requireAuth, restoreVersion);

export default router;
