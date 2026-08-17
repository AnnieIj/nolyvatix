/**
 * Nolyvatix Server - Firebase Authentication Middleware & Request Scoping
 * Protects user-scoped endpoints, verifies Firebase ID tokens, provisions local users JIT,
 * and attaches verified AuthenticatedUser identity to req.user.
 */

import { Request, Response, NextFunction } from 'express';
import { getFirebaseAuthAdmin } from '../clients/firebaseAdmin.ts';
import { UserDbRepository } from '../repositories/db/userDbRepository.ts';
import { sendError } from './responseWrapper.ts';
import { Logger } from '../utils/logger.ts';

const logger = new Logger('AuthMiddleware');
const defaultUserRepo = new UserDbRepository();

export interface AuthenticatedUser {
  id: number;
  uid: string;
  email: string;
  displayName: string | null;
  avatarUrl: string | null;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

/**
 * Helper to determine if development fallback is strictly permitted
 */
function isDevFallbackAllowed(): boolean {
  return (
    process.env.NODE_ENV !== 'production' &&
    process.env.ALLOW_DEV_FALLBACK === 'true'
  );
}

/**
 * Strict authentication middleware for protected routes
 */
export function createAuthenticateUserMiddleware(userRepo: UserDbRepository = defaultUserRepo) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      if (isDevFallbackAllowed()) {
        logger.debug('No Authorization header, using ALLOW_DEV_FALLBACK operator identity');
        const defaultUser = await userRepo.getOrCreateDefaultUser();
        req.user = {
          id: defaultUser.id,
          uid: defaultUser.uid,
          email: defaultUser.email,
          displayName: defaultUser.displayName,
          avatarUrl: defaultUser.avatarUrl,
        };
        return next();
      }

      sendError(res, 'Authentication required: Missing Authorization header', 401);
      return;
    }

    if (!authHeader.startsWith('Bearer ')) {
      sendError(res, 'Authentication required: Authorization header must use Bearer scheme', 401);
      return;
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      sendError(res, 'Authentication required: Bearer token is empty', 401);
      return;
    }

    try {
      const authAdmin = getFirebaseAuthAdmin();
      const decodedToken = await authAdmin.verifyIdToken(token, true);

      const uid = decodedToken.uid;
      const email = decodedToken.email || `${uid}@nolyvatix.io`;
      const displayName = decodedToken.name || null;
      const avatarUrl = decodedToken.picture || null;

      const dbUser = await userRepo.getOrCreateUserFromFirebase(uid, email, displayName, avatarUrl);

      req.user = {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        displayName: dbUser.displayName,
        avatarUrl: dbUser.avatarUrl,
      };

      next();
    } catch (error: any) {
      logger.error('Firebase ID token verification failed:', error?.message || error);
      
      let message = 'Invalid or expired authentication token';
      if (error?.code === 'auth/id-token-expired') {
        message = 'Authentication token has expired';
      } else if (error?.code === 'auth/id-token-revoked') {
        message = 'Authentication token has been revoked';
      } else if (error?.code === 'auth/argument-error') {
        message = 'Malformed authentication token';
      }

      sendError(res, message, 401);
    }
  };
}

export const authenticateUser = createAuthenticateUserMiddleware();

/**
 * Optional authentication middleware: populates req.user if a valid Bearer token is present,
 * but proceeds unauthenticated if no token is provided.
 */
export function createOptionalAuthenticateUserMiddleware(userRepo: UserDbRepository = defaultUserRepo) {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next();
    }

    const token = authHeader.substring(7).trim();
    if (!token) {
      return next();
    }

    try {
      const authAdmin = getFirebaseAuthAdmin();
      const decodedToken = await authAdmin.verifyIdToken(token, false);

      const uid = decodedToken.uid;
      const email = decodedToken.email || `${uid}@nolyvatix.io`;
      const displayName = decodedToken.name || null;
      const avatarUrl = decodedToken.picture || null;

      const dbUser = await userRepo.getOrCreateUserFromFirebase(uid, email, displayName, avatarUrl);

      req.user = {
        id: dbUser.id,
        uid: dbUser.uid,
        email: dbUser.email,
        displayName: dbUser.displayName,
        avatarUrl: dbUser.avatarUrl,
      };
    } catch (error) {
      logger.debug('Optional token verification ignored:', error);
    }

    next();
  };
}

export const optionalAuthenticateUser = createOptionalAuthenticateUserMiddleware();
