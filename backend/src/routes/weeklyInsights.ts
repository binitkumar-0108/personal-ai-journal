import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userRateLimiter } from '../middleware/rateLimiter.js';
import { getVerifiedUserRecentEntries, saveWeeklyInsight } from '../services/firestoreService.js';
import { generateWeeklyInsights } from '../services/geminiService.js';
import type { AuthenticatedRequest } from '../types/index.js';

export const weeklyInsightsRouter = Router();

weeklyInsightsRouter.post(
  '/weekly-insights',
  requireAuth,
  userRateLimiter,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const verifiedUid = authReq.user.uid;

      // 1. Fetch entries strictly for this verified user
      const userEntries = await getVerifiedUserRecentEntries(verifiedUid, 14);

      // 2. Synthesize with Gemini
      const synthesizedData = await generateWeeklyInsights(userEntries);

      // 3. Save insight in Firestore via Admin SDK
      const savedInsight = await saveWeeklyInsight(verifiedUid, synthesizedData);

      res.status(200).json({ insight: savedInsight });
    } catch {
      res.status(502).json({ error: 'AI Service Unavailable: Failed to synthesize weekly insights. Please try again.' });
    }
  },
);
