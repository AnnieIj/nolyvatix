/**
 * Nolyvatix Data Engine - Account Routes (/api/accounts)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AccountService } from '../services/accountService.ts';
import { createSuccessResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createAccountRouter(accountService: AccountService): Router {
  const router = Router();

  /**
   * GET /api/accounts/:accountId
   */
  router.get('/:accountId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const account = await accountService.getAccount(accountId);
      res.json(createSuccessResponse(account));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/accounts/:accountId/balances
   */
  router.get('/:accountId/balances', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const account = await accountService.getAccount(accountId);
      res.json(createSuccessResponse(account.balances));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/accounts/:accountId/transactions
   */
  router.get('/:accountId/transactions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const txs = await accountService.getAccountTransactions(accountId);
      res.json(createSuccessResponse(txs));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/accounts/:accountId/operations
   */
  router.get('/:accountId/operations', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const ops = await accountService.getAccountOperations(accountId);
      res.json(createSuccessResponse(ops));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/accounts/:accountId/payments
   */
  router.get('/:accountId/payments', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const payments = await accountService.getAccountPayments(accountId);
      res.json(createSuccessResponse(payments));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/accounts/:accountId/analytics
   */
  router.get('/:accountId/analytics', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const accountId = req.params.accountId;
      if (!accountId || !accountId.startsWith('G') || accountId.length !== 56) {
        throw new ValidationError('Invalid Stellar G... Public Account Key');
      }

      const analytics = await accountService.getAccountAnalytics(accountId);
      res.json(createSuccessResponse(analytics));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
