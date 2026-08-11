/**
 * Nolyvatix Data Engine — Security Headers & CORS Middleware
 * Implements Helmet-equivalent security headers and configurable CORS protection.
 */

import { Request, Response, NextFunction } from 'express';

export function securityHeadersMiddleware(_req: Request, res: Response, next: NextFunction): void {
  // Prevent MIME type sniffing
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // Clickjacking protection
  res.setHeader('X-Frame-Options', 'SAMEORIGIN');

  // Enable XSS filter in legacy browsers
  res.setHeader('X-XSS-Protection', '1; mode=block');

  // Control referrer information sent in headers
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Restrict sensitive browser permissions
  res.setHeader('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');

  // Strict Transport Security (for HTTPS deployments)
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');

  // CORS Headers
  const allowedOrigin = process.env.CORS_ALLOWED_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowedOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-Workspace-ID');
  res.setHeader('Access-Control-Max-Age', '86400');

  // Handle preflight OPTIONS requests
  if (_req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
