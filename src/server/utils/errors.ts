/**
 * Nolyvatix Data Engine - Domain Error Definitions
 */

export class AppError extends Error {
  public statusCode: number;
  public errorCode: string;
  public details?: unknown;

  constructor(message: string, statusCode: number = 500, errorCode: string = 'INTERNAL_ERROR', details?: unknown) {
    super(message);
    this.name = this.constructor.name;
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class NotFoundError extends AppError {
  constructor(entityName: string = 'Resource', identifier?: string | number) {
    const message = identifier ? `${entityName} with identifier '${identifier}' was not found.` : `${entityName} not found.`;
    super(message, 404, 'NOT_FOUND');
  }
}

export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details);
  }
}

export class RateLimitError extends AppError {
  public retryAfterSeconds?: number;

  constructor(message: string = 'Rate limit exceeded. Please slow down your requests.', retryAfterSeconds?: number) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', { retryAfterSeconds });
    this.retryAfterSeconds = retryAfterSeconds;
  }
}

export class HorizonApiError extends AppError {
  public horizonStatus?: number;

  constructor(message: string, horizonStatus?: number, details?: unknown) {
    const statusCode = horizonStatus && horizonStatus >= 400 && horizonStatus < 600 ? horizonStatus : 502;
    super(`Horizon API Error: ${message}`, statusCode, 'HORIZON_API_ERROR', details);
    this.horizonStatus = horizonStatus;
  }
}

export class SorobanRpcError extends AppError {
  public rpcCode?: number;

  constructor(message: string, rpcCode?: number, details?: unknown) {
    super(`Soroban RPC Error: ${message}`, 502, 'SOROBAN_RPC_ERROR', details);
    this.rpcCode = rpcCode;
  }
}
