/**
 * Nolyvatix Data Engine - API Response Wrapper & Global Error Handler Middleware
 */

import { Request, Response, NextFunction } from 'express';
import { ApiResponse, ApiPaginatedResponse } from '../types/stellar.js';
import { AppError } from '../utils/errors.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('ResponseWrapper');

export function createSuccessResponse<T>(data: T): ApiResponse<T> {
  return {
    success: true,
    data,
    timestamp: new Date().toISOString(),
  };
}

export function createPaginatedResponse<T>(
  data: T[],
  pagination: {
    cursor?: string;
    nextCursor?: string;
    prevCursor?: string;
    limit: number;
    hasMore: boolean;
  }
): ApiPaginatedResponse<T> {
  return {
    success: true,
    data,
    pagination,
    timestamp: new Date().toISOString(),
  };
}

export function createErrorResponse(code: string, message: string, details?: unknown): ApiResponse<never> {
  return {
    success: false,
    error: {
      code,
      message,
      details,
    },
    timestamp: new Date().toISOString(),
  };
}

export function sendSuccess<T>(res: Response, data: T, statusCode = 200): void {
  res.status(statusCode).json(createSuccessResponse(data));
}

export function sendError(res: Response, message: string, statusCode = 400, code = 'ERROR', details?: unknown): void {
  const resolvedCode = statusCode === 404 ? 'NOT_FOUND' : code;
  res.status(statusCode).json(createErrorResponse(resolvedCode, message, details));
}

export function globalErrorHandler(
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  if (err instanceof AppError) {
    logger.warn(`AppError [${err.errorCode}]: ${err.message}`, { statusCode: err.statusCode, details: err.details });
    res.status(err.statusCode).json(createErrorResponse(err.errorCode, err.message, err.details));
    return;
  }

  logger.error(`Unhandled Exception: ${err.message}`, { stack: err.stack });
  res.status(500).json(createErrorResponse('INTERNAL_SERVER_ERROR', 'An unexpected error occurred in the Stellar Data Engine.'));
}
