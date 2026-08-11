/**
 * Nolyvatix Data Engine — API Rate Limiter Middleware
 * In-memory sliding window rate limiter for API protection.
 */

import { Request, Response, NextFunction } from 'express';
import { Logger } from '../utils/logger.js';

const logger = new Logger('RateLimiter');

interface RateLimitRecord {
  count: number;
  resetAt: number;
}

export function createRateLimiter(maxRequestsPerWindow = 300, windowMs = 60000) {
  const hitsMap = new Map<string, RateLimitRecord>();

  // Periodically clean up expired entries every 2 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [ip, record] of hitsMap.entries()) {
      if (now > record.resetAt) {
        hitsMap.delete(ip);
      }
    }
  }, 120000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || '127.0.0.1';
    const now = Date.now();

    let record = hitsMap.get(ip);
    if (!record || now > record.resetAt) {
      record = { count: 1, resetAt: now + windowMs };
      hitsMap.set(ip, record);
    } else {
      record.count++;
    }

    const remaining = Math.max(0, maxRequestsPerWindow - record.count);
    const resetSeconds = Math.ceil((record.resetAt - now) / 1000);

    res.setHeader('X-RateLimit-Limit', maxRequestsPerWindow);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil(record.resetAt / 1000));

    if (record.count > maxRequestsPerWindow) {
      logger.warn(`Rate limit exceeded for IP: ${ip} on route ${req.originalUrl}`);
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
