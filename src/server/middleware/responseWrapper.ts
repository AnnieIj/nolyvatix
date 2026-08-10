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

/**
 * Maps a numeric HTTP status code to a stable machine-readable error code.
 */
function statusToErrorCode(status: number): string {
  switch (status) {
    case 400:
      return 'BAD_REQUEST';
    case 401:
      return 'UNAUTHORIZED';
    case 403:
      return 'FORBIDDEN';
    case 404:
      return 'NOT_FOUND';
    case 409:
      return 'CONFLICT';
    case 422:
      return 'UNPROCESSABLE_ENTITY';
    case 429:
      return 'RATE_LIMITED';
    default:
      return status >= 500 ? 'INTERNAL_SERVER_ERROR' : 'ERROR';
  }
}

/**
 * Canonical success responder. Wraps `createSuccessResponse` and writes the
 * given HTTP status (defaults to 200). Used by all Express route handlers.
 */
export function sendSuccess<T>(res: Response, data: T, status = 200): void {
  res.status(status).json(createSuccessResponse(data));
}

/**
 * Canonical error responder. Wraps `createErrorResponse` and writes the given
 * HTTP status (defaults to 400) with a derived machine-readable error code.
 */
export function sendError(
  res: Response,
  message: string,
  status = 400,
  details?: unknown,
  code?: string
): void {
  res.status(status).json(createErrorResponse(code ?? statusToErrorCode(status), message, details));
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
