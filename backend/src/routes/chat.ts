import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userRateLimiter } from '../middleware/rateLimiter.js';
import { validateChatBody } from '../middleware/validate.js';
import { generateChatReply } from '../services/geminiService.js';
import type { AuthenticatedRequest } from '../types/index.js';

export const chatRouter = Router();

chatRouter.post(
  '/chat',
  requireAuth,
  userRateLimiter,
  validateChatBody,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { history = [], latestText } = authReq.body;
      const reply = await generateChatReply(history, latestText);
      res.status(200).json({ reply });
    } catch (err: unknown) {
      const msg = (err as Error)?.message || '';
      const status = (err as { status?: number })?.status;
      if (status === 429 || msg.includes('429') || msg.includes('depleted') || msg.includes('quota')) {
        res.status(429).json({ error: 'Google AI Studio quota or prepayment credits depleted on this project.' });
        return;
      }
      res.status(502).json({ error: 'AI Service Unavailable: Failed to generate chat response. Please try again.' });
    }
  },
);
