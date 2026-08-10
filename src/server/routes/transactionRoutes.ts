/**
 * Nolyvatix Data Engine - Transaction Routes (/api/transactions)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { TransactionService } from '../services/transactionService.ts';
import { OperationService } from '../services/operationService.ts';
import { createSuccessResponse, createPaginatedResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createTransactionRouter(
  txService: TransactionService,
  opService: OperationService
): Router {
  const router = Router();

  /**
   * GET /api/transactions
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const txs = await txService.getTransactions({ cursor, order, limit });
      const nextCursor = txs.length > 0 ? txs[txs.length - 1].id : undefined;

      res.json(
        createPaginatedResponse(txs, {
          cursor,
          nextCursor,
          limit,
          hasMore: txs.length === limit,
        })
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/transactions/:hash
   */
  router.get('/:hash', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hash = req.params.hash;
      if (!hash || hash.length < 32) {
        throw new ValidationError('Invalid transaction hash identifier');
      }

      const tx = await txService.getTransactionByHash(hash);
      res.json(createSuccessResponse(tx));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/transactions/:hash/operations
   */
  router.get('/:hash/operations', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const hash = req.params.hash;
      if (!hash || hash.length < 32) {
        throw new ValidationError('Invalid transaction hash identifier');
      }

      const ops = await opService.getOperationsByTransaction(hash);
      res.json(createSuccessResponse(ops));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
