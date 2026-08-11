/**
 * Nolyvatix Data Engine — Security Headers & CORS Middleware
 * Production-hardened headers: CSP, HSTS, CORS allowlist, Cross-Origin isolation.
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SecurityHeaders');

/**
 * Parse the CORS_ALLOWED_ORIGINS env variable into a Set for O(1) lookup.
 * Accepts a comma-separated list of origins, e.g.:
 *   CORS_ALLOWED_ORIGINS="https://nolyvatix.onrender.com,https://www.nolyvatix.com"
 *
 * Falls back to allowing the APP_URL only. If neither is set, only same-origin
 * requests are permitted (no Access-Control-Allow-Origin header is emitted).
 */
function buildAllowedOriginsSet(): Set<string> {
  const raw = process.env.CORS_ALLOWED_ORIGINS || process.env.CORS_ALLOWED_ORIGIN || process.env.APP_URL || '';
  const origins = raw
    .split(',')
    .map((o) => o.trim())
    .filter(Boolean);
  return new Set(origins);
}

const ALLOWED_ORIGINS: Set<string> = buildAllowedOriginsSet();

if (ALLOWED_ORIGINS.size === 0) {
  logger.warn(
    'CORS_ALLOWED_ORIGINS is not set. Cross-origin requests will be blocked. ' +
    'Set CORS_ALLOWED_ORIGINS in your environment for production deployments.'
  );
}

/**
 * Build the Content-Security-Policy header value.
 *
 * Design decisions:
 * - `default-src 'self'` — deny everything not explicitly allowed.
 * - `script-src 'self' 'unsafe-inline'` — required for Vite React HMR / inline scripts
 *   from the SPA bundle. In a future hardening pass this can be replaced with nonces.
 * - `connect-src` — allows XHR/fetch to the same origin plus the Stellar public APIs
 *   used by the client-side horizon.ts and soroban.ts service files.
 * - `img-src 'self' data:` — allows base64 data URIs used by chart exports.
 * - `font-src 'self' https://fonts.gstatic.com` — Google Fonts CDN for Inter/JetBrains Mono.
 * - `style-src 'self' 'unsafe-inline' https://fonts.googleapis.com` — Tailwind inlines styles.
 * - `frame-ancestors 'none'` — stronger clickjacking protection than X-Frame-Options.
 * - `base-uri 'self'` — prevents base tag injection attacks.
 * - `form-action 'self'` — prevents form hijacking.
 * - `object-src 'none'` — blocks Flash/plugins entirely.
 */
function buildCSP(): string {
  const stellarHorizonOrigins = [
    'https://horizon.stellar.org',
    'https://horizon-testnet.stellar.org',
    'https://horizon-futurenet.stellar.org',
    'https://soroban-rpc.mainnet.stellar.org',
    'https://soroban-testnet.stellar.org',
    'https://generativelanguage.googleapis.com', // Gemini AI API
  ].join(' ');

  const directives: string[] = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline'",
    `connect-src 'self' ${stellarHorizonOrigins}`,
    "img-src 'self' data: blob:",
    "font-src 'self' https://fonts.gstatic.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "object-src 'none'",
    "upgrade-insecure-requests",
  ];

  return directives.join('; ');
}

const CSP_VALUE = buildCSP();

export function securityHeadersMiddleware(req: Request, res: Response, next: NextFunction): void {
  // ── MIME Sniffing Protection ──────────────────────────────────────────────
  res.setHeader('X-Content-Type-Options', 'nosniff');

  // ── Clickjacking Protection (CSP frame-ancestors is also set below) ───────
  res.setHeader('X-Frame-Options', 'DENY');

  // ── Legacy XSS Filter (kept for IE 11 compat; modern browsers ignore it) ─
  res.setHeader('X-XSS-Protection', '0'); // '0' disables the buggy IE filter; CSP is the real protection

  // ── Referrer Policy ───────────────────────────────────────────────────────
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

  // ── Content Security Policy ───────────────────────────────────────────────
  res.setHeader('Content-Security-Policy', CSP_VALUE);

  // ── HTTP Strict Transport Security ────────────────────────────────────────
  // Only emit HSTS over HTTPS; emitting on HTTP causes browser lockout.
  // Render.com and most PaaS providers terminate TLS at the proxy, so we
  // check the X-Forwarded-Proto header set by the reverse proxy.
  const proto = req.headers['x-forwarded-proto'];
  const isHttps = proto === 'https' || process.env.FORCE_HSTS === 'true';
  if (isHttps) {
    // max-age=1 year; includeSubDomains; preload
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  // ── Permissions Policy ────────────────────────────────────────────────────
  res.setHeader(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()'
  );

  // ── Cross-Origin Resource Policy ─────────────────────────────────────────
  res.setHeader('Cross-Origin-Resource-Policy', 'same-origin');

  // ── Cross-Origin Opener Policy ────────────────────────────────────────────
  res.setHeader('Cross-Origin-Opener-Policy', 'same-origin');

  // ── Remove fingerprinting headers ─────────────────────────────────────────
  res.removeHeader('X-Powered-By');

  // ── CORS ──────────────────────────────────────────────────────────────────
  const requestOrigin = req.headers.origin;

  if (requestOrigin && ALLOWED_ORIGINS.has(requestOrigin)) {
    // Origin is explicitly whitelisted — emit CORS headers
    res.setHeader('Access-Control-Allow-Origin', requestOrigin);
    res.setHeader('Vary', 'Origin');
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization, X-Requested-With, X-Workspace-ID'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
  } else if (!requestOrigin) {
    // Same-origin request (no Origin header) — allow without CORS headers
  } else {
    // Unknown origin — do NOT emit CORS headers; browser will block the request
    logger.warn(`CORS: Rejected cross-origin request from: ${requestOrigin}`);
  }

  // ── Preflight fast-path ───────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  next();
}
