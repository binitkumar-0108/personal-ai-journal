import express, { type Request, type Response } from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { PORT } from './config/env.js';
import { healthRouter } from './routes/health.js';
import { chatRouter } from './routes/chat.js';
import { summarizeRouter } from './routes/summarize.js';
import { reflectionRouter } from './routes/reflection.js';
import { weeklyInsightsRouter } from './routes/weeklyInsights.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Body parser
app.use(express.json({ limit: '1mb' }));

// Mount API routes
app.use('/api', healthRouter);
app.use('/api', chatRouter);
app.use('/api', summarizeRouter);
app.use('/api', reflectionRouter);
app.use('/api', weeklyInsightsRouter);

// Serve built frontend assets in production / single-container mode
const possibleStaticDirs = [
  path.resolve(__dirname, '../../dist'),      // Local / monorepo layout
  path.resolve(__dirname, '../public'),       // Containerized layout
  path.resolve(process.cwd(), 'dist'),        // Root execution layout
];

let staticDir: string | null = null;
for (const dir of possibleStaticDirs) {
  if (fs.existsSync(dir) && fs.existsSync(path.join(dir, 'index.html'))) {
    staticDir = dir;
    break;
  }
}

if (staticDir) {
  app.use(express.static(staticDir));

  // SPA fallback to index.html for non-API routes
  app.get('*', (req: Request, res: Response) => {
    if (!req.path.startsWith('/api')) {
      res.sendFile(path.join(staticDir!, 'index.html'));
    } else {
      res.status(404).json({ error: 'Endpoint not found.' });
    }
  });
}

// Global 404 for unhandled API requests
app.use('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({ error: 'API endpoint not found.' });
});

// Start listening on configured PORT
const server = app.listen(PORT, () => {
  console.log(`Personal AI Journal backend listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  server.close(() => {
    process.exit(0);
  });
});
