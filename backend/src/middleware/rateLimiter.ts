import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from '../types/index.js';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const userRequestMap = new Map<string, RateLimitRecord>();

const WINDOW_MS = 60 * 1000; // 1 minute window
const MAX_REQUESTS_PER_WINDOW = 30; // Max 30 AI calls per minute per authenticated UID

// Clean up stale rate limit entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [uid, record] of userRequestMap.entries()) {
    if (now > record.resetTime) {
      userRequestMap.delete(uid);
    }
  }
}, 5 * 60 * 1000);

/**
 * Per-user rate limiting middleware for AI endpoints.
 * Keyed strictly by verified Firebase UID (req.user.uid).
 */
export function userRateLimiter(
  req: Request,
  res: Response,
  next: NextFunction,
): void {
  const uid = (req as AuthenticatedRequest).user?.uid;
  if (!uid) {
    res.status(401).json({ error: 'Unauthorized: User identity not found.' });
    return;
  }

  const now = Date.now();
  const userRecord = userRequestMap.get(uid);

  if (!userRecord || now > userRecord.resetTime) {
    userRequestMap.set(uid, {
      count: 1,
      resetTime: now + WINDOW_MS,
    });
    next();
    return;
  }

  if (userRecord.count >= MAX_REQUESTS_PER_WINDOW) {
    res.status(429).json({
      error: 'Too Many Requests: Rate limit exceeded for AI operations. Please wait a moment before trying again.',
    });
    return;
  }

  userRecord.count += 1;
  next();
}
