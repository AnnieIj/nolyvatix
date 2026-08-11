/**
 * Nolyvatix Main Express Server
 */

import express from 'express';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import { initializeDataEngine } from './src/server/dataEngine.js';
import { globalErrorHandler, createErrorResponse } from './src/server/middleware/responseWrapper.js';
import { logger } from './src/server/utils/logger.js';

import { securityHeadersMiddleware } from './src/server/middleware/securityHeaders.js';
import { createRateLimiter } from './src/server/middleware/rateLimiter.js';

async function startServer(): Promise<void> {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Enable proxy trust for reverse proxies (Render, Cloudflare, AWS ALB, Nginx)
  // Needed for accurate client IP detection (rate limiter) & X-Forwarded-Proto (HSTS)
  app.set('trust proxy', 1);

  // Apply Production Security Headers & CORS Allowlist
  app.use(securityHeadersMiddleware);

  // Limit JSON body size to 1MB to prevent payload DoS attacks
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: true, limit: '1mb' }));

  // Strict rate limiter for expensive AI endpoints (30 requests per minute)
  const aiRateLimiter = createRateLimiter(30, 60000);
  app.use('/api/ai', aiRateLimiter);

  // General rate limiter for all API endpoints (300 requests per minute)
  const generalRateLimiter = createRateLimiter(300, 60000);
  app.use('/api', generalRateLimiter);

  // Initialize Stellar Data Engine & mount API routes
  const dataEngine = initializeDataEngine();
  app.use('/api', dataEngine.apiRouter);

  // Fallback 404 handler for API routes
  app.use('/api/*', (req, res) => {
    res.status(404).json(createErrorResponse('NOT_FOUND', `API endpoint '${req.originalUrl}' does not exist.`));
  });

  // Vite Middleware for Dev / Static fallback for Prod
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath, { index: false }));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Global Error Handler Middleware (must be registered after all routes and app.use calls)
  app.use(globalErrorHandler);

  app.listen(PORT, '0.0.0.0', () => {
    logger.info(`Nolyvatix Express Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  logger.error('Failed to start server:', { error: err });
  process.exit(1);
});
