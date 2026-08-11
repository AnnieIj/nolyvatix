/**
 * Nolyvatix Main Express Server
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeDataEngine } from './src/server/dataEngine.js';
import { globalErrorHandler } from './src/server/middleware/responseWrapper.js';
import { logger } from './src/server/utils/logger.js';

import { securityHeadersMiddleware } from './src/server/middleware/securityHeaders.js';
import { createRateLimiter } from './src/server/middleware/rateLimiter.js';

async function startServer(): Promise<void> {
  const app = express();
  const PORT = 3000;

  // Apply Security Headers & CORS
  app.use(securityHeadersMiddleware);

  app.use(express.json());

  // Apply Rate Limiter to all API endpoints (300 requests per minute)
  app.use('/api', createRateLimiter(300, 60000));

  // Initialize Stellar Data Engine & mount API routes
  const dataEngine = initializeDataEngine();
  app.use('/api', dataEngine.apiRouter);

  // Vite Middleware for Dev / Static fallback for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler Middleware
  app.use(globalErrorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Nolyvatix Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', { error: err });
  process.exit(1);
});
