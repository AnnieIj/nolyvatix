/**
 * Nolyvatix Data Engine — API Rate Limiter Middleware
 * In-memory sliding window rate limiter for API protection.
 * Supports reverse proxy IP resolution, configurable limits per endpoint group,
 * and automatic memory cleanup.
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

const logger = new Logger('RateLimiter');

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  maxRequests?: number;
  windowMs?: number;
  keyGenerator?: (req: Request) => string;
}

/**
 * Creates an Express middleware rate limiter.
 *
 * @param maxRequestsPerWindow Maximum requests allowed per window (default: 300)
 * @param windowMs Window duration in milliseconds (default: 60000ms / 1 min)
 * @param keyGenerator Custom function to extract rate-limiting key (defaults to client IP)
 */
export function createRateLimiter(
  maxRequestsPerWindow = 300,
  windowMs = 60000,
  keyGenerator?: (req: Request) => string
) {
  const hitsMap = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries every 2 minutes
  const cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, record] of hitsMap.entries()) {
      if (now > record.resetAt) {
        hitsMap.delete(key);
      }
    }
  }, 120000);

  if (cleanupTimer.unref) {
    cleanupTimer.unref();
  }

  const defaultKeyGen = (req: Request): string => {
    // Express req.ip respects 'trust proxy' setting
    const forwardedFor = req.headers['x-forwarded-for'];
    const ipFromHeader = typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : undefined;
    return req.ip || ipFromHeader || req.socket.remoteAddress || '127.0.0.1';
  };

  const getKey = keyGenerator || defaultKeyGen;

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = getKey(req);
    const now = Date.now();

    let record = hitsMap.get(key);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      hitsMap.set(key, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequestsPerWindow - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequestsPerWindow);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > maxRequestsPerWindow) {
      logger.warn(`Rate limit exceeded for key: ${key} on route ${req.originalUrl}`);
      res.setHeader('Retry-After', resetSeconds);
      res.status(429).json({
        success: false,
        error: {
          code: 'RATE_LIMIT_EXCEEDED',
          message: `Too many requests. Limit is ${maxRequestsPerWindow} per ${windowMs / 1000} seconds. Please try again in ${resetSeconds}s.`,
        },
        timestamp: new Date().toISOString(),
      });
      return;
    }

    next();
  };
}
