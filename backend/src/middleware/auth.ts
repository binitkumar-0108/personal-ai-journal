import type { Request, Response, NextFunction } from 'express';
import { adminAuth } from '../config/firebaseAdmin.js';
import type { AuthenticatedRequest } from '../types/index.js';

/**
 * Authentication middleware enforcing verified Firebase ID tokens.
 *
 * Invariants:
 * 1. Reads 'Authorization: Bearer <token>'.
 * 2. Verifies token via Firebase Admin SDK.
 * 3. Extracts UID exclusively from the verified token.
 * 4. Rejects invalid, missing, or expired tokens with HTTP 401.
 * 5. Identity from request body / query is strictly ignored and rejected.
 */
export async function requireAuth(
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const authHeader = req.headers.authorization;
  const hasAuthHeader = Boolean(authHeader);
  const isBearer = Boolean(authHeader && authHeader.startsWith('Bearer '));

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    console.warn(`[Auth Diagnostic] Missing or malformed header. Header exists: ${hasAuthHeader}, Bearer detected: ${isBearer}`);
    res.status(401).json({ error: 'Unauthorized: Missing or malformed Authorization header.' });
    return;
  }

  const token = authHeader.split('Bearer ')[1]?.trim();

  if (!token) {
    console.warn(`[Auth Diagnostic] Empty Bearer token received.`);
    res.status(401).json({ error: 'Unauthorized: Bearer token is required.' });
    return;
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    (req as AuthenticatedRequest).user = {
      uid: decodedToken.uid,
      email: decodedToken.email,
    };
    next();
  } catch (err: unknown) {
    // Safe diagnostic logging: error code and project info only - NEVER log the token, prompt, content, or secrets
    const errorCode = (err as { code?: string })?.code || 'unknown-error';
    const errorMessage = (err as Error)?.message || '';
    console.error(`[Auth Diagnostic] Token verification failed. Error code: ${errorCode}. Message summary: ${errorMessage.slice(0, 120)}`);
    res.status(401).json({ error: 'Unauthorized: Invalid or expired authentication token.' });
  }
}
