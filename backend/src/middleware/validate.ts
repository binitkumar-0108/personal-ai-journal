import type { Request, Response, NextFunction } from 'express';

const MAX_CONTENT_LENGTH = 50000;
const MAX_LATEST_TEXT_LENGTH = 10000;
const MAX_MESSAGES_COUNT = 100;

export function validateChatBody(req: Request, res: Response, next: NextFunction): void {
  const { history, latestText } = req.body;

  if (typeof latestText !== 'string' || latestText.trim().length === 0) {
    res.status(400).json({ error: 'Bad Request: latestText must be a non-empty string.' });
    return;
  }

  if (latestText.length > MAX_LATEST_TEXT_LENGTH) {
    res.status(400).json({
      error: `Bad Request: latestText exceeds the maximum length of ${MAX_LATEST_TEXT_LENGTH} characters.`,
    });
    return;
  }

  if (history !== undefined) {
    if (!Array.isArray(history)) {
      res.status(400).json({ error: 'Bad Request: history must be an array of messages.' });
      return;
    }
    if (history.length > MAX_MESSAGES_COUNT) {
      res.status(400).json({
        error: `Bad Request: history exceeds the maximum limit of ${MAX_MESSAGES_COUNT} messages.`,
      });
      return;
    }
  }

  next();
}

export function validateSummarizeBody(req: Request, res: Response, next: NextFunction): void {
  const { content } = req.body;

  if (typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Bad Request: content must be a non-empty string.' });
    return;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({
      error: `Bad Request: content exceeds the maximum length of ${MAX_CONTENT_LENGTH} characters.`,
    });
    return;
  }

  next();
}

export function validateReflectionBody(req: Request, res: Response, next: NextFunction): void {
  const { mode, content, conversation } = req.body;

  if (!['write', 'summarize', 'conversation'].includes(mode)) {
    res.status(400).json({ error: "Bad Request: mode must be 'write', 'summarize', or 'conversation'." });
    return;
  }

  if (typeof content !== 'string' || content.trim().length === 0) {
    res.status(400).json({ error: 'Bad Request: content must be a non-empty string.' });
    return;
  }

  if (content.length > MAX_CONTENT_LENGTH) {
    res.status(400).json({
      error: `Bad Request: content exceeds the maximum length of ${MAX_CONTENT_LENGTH} characters.`,
    });
    return;
  }

  if (conversation !== undefined) {
    if (!Array.isArray(conversation)) {
      res.status(400).json({ error: 'Bad Request: conversation must be an array of messages.' });
      return;
    }
    if (conversation.length > MAX_MESSAGES_COUNT) {
      res.status(400).json({
        error: `Bad Request: conversation exceeds the maximum limit of ${MAX_MESSAGES_COUNT} messages.`,
      });
      return;
    }
  }

  next();
}
