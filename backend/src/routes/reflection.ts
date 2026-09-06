import { Router, type Request, type Response } from 'express';
import { requireAuth } from '../middleware/auth.js';
import { userRateLimiter } from '../middleware/rateLimiter.js';
import { validateReflectionBody } from '../middleware/validate.js';
import { generateStructuredReflection } from '../services/geminiService.js';
import { writeEntryAIReflection } from '../services/firestoreService.js';
import type { AuthenticatedRequest } from '../types/index.js';

export const reflectionRouter = Router();

reflectionRouter.post(
  '/reflection',
  requireAuth,
  userRateLimiter,
  validateReflectionBody,
  async (req: Request, res: Response): Promise<void> => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { mode, content, conversation, journalId, entryId } = authReq.body;

      const reflection = await generateStructuredReflection(mode, content, conversation);

      // If target journalId and entryId are provided, persist aiReflection via Admin SDK
      if (typeof journalId === 'string' && typeof entryId === 'string' && journalId && entryId) {
        try {
          await writeEntryAIReflection(authReq.user.uid, journalId, entryId, reflection);
        } catch {
          // Entry persistence failed, but reflection was still successfully synthesized
        }
      }

      res.status(200).json({ reflection });
    } catch (err: unknown) {
      const anyErr = err as { status?: number; response?: { status?: number }; message?: string; errorDetails?: unknown };
      const key = process.env.GEMINI_API_KEY;
      console.error('--- GEMINI UPSTREAM ERROR ---');
      console.error('HTTP status returned by Gemini:', anyErr?.status || anyErr?.response?.status || 'N/A');
      console.error('Gemini error code/reason:', anyErr?.message || anyErr?.errorDetails || 'N/A');
      console.error('Model name being requested:', process.env.GEMINI_MODEL || 'gemini-flash-latest');
      console.error('Endpoint/API SDK being used:', '@google/generative-ai');
      console.error('Whether GEMINI_API_KEY exists:', Boolean(key));
      console.error('Length of GEMINI_API_KEY:', key ? key.length : 0);
      console.error('-----------------------------');

      const msg = (err as Error)?.message || '';
      const status = (err as { status?: number })?.status;
      if (status === 429 || msg.includes('429') || msg.includes('depleted') || msg.includes('quota')) {
        res.status(429).json({ error: 'Google AI Studio quota or prepayment credits depleted on this project.' });
        return;
      }
      res.status(502).json({ error: 'AI Service Unavailable: Failed to generate reflection. Please try again.' });
    }
  },
);
