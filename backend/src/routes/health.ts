import { Router, type Request, type Response } from 'express';

export const healthRouter = Router();

healthRouter.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});
