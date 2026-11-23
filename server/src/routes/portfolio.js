import { Router } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { aiLimiter } from '../middleware/rateLimit.js';
import {
  getMyPortfolio, getGitHubBackground, updateMyPortfolio, generatePortfolio, regenerateSection, previewPortfolio,
  downloadZip, checkSlug, publishPortfolio, unpublishPortfolio, listVersions, restoreVersion, getNetworkInfo,
} from '../controllers/portfolioController.js';

const router = Router();
router.use(requireAuth); // every portfolio-management route is private; data is scoped to req.user

router.get('/', getMyPortfolio);
router.get('/network-info', getNetworkInfo);
router.get('/github-background', getGitHubBackground);
router.put('/', updateMyPortfolio);
router.post('/generate', aiLimiter, generatePortfolio);
router.post('/regenerate', aiLimiter, regenerateSection);
router.post('/preview', previewPortfolio);
router.get('/export', downloadZip);
router.get('/slug-check', checkSlug);
router.post('/publish', publishPortfolio);
router.post('/unpublish', unpublishPortfolio);
router.get('/versions', listVersions);
router.post('/versions/:versionId/restore', restoreVersion);

export default router;
