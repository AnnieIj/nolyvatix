/**
 * Nolyvatix Data Engine - Ledger Routes (/api/ledgers)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { LedgerService } from '../services/ledgerService.ts';
import { TransactionService } from '../services/transactionService.ts';
import { OperationService } from '../services/operationService.ts';
import { createSuccessResponse, createPaginatedResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createLedgerRouter(
  ledgerService: LedgerService,
  txService: TransactionService,
  opService: OperationService
): Router {
  const router = Router();

  /**
   * GET /api/ledgers
   * Query params: cursor, order, limit
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const ledgers = await ledgerService.getLatestLedgers({ cursor, order, limit });
      const nextCursor = ledgers.length > 0 ? String(ledgers[ledgers.length - 1].sequence) : undefined;

      res.json(
        createPaginatedResponse(ledgers, {
          cursor,
          nextCursor,
          limit,
          hasMore: ledgers.length === limit,
        })
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/ledgers/latest
   */
  router.get('/latest', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const ledgers = await ledgerService.getLatestLedgers({ limit: 1, order: 'desc' });
      res.json(createSuccessResponse(ledgers[0] || null));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/ledgers/:sequence
   */
  router.get('/:sequence', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sequence = parseInt(req.params.sequence, 10);
      if (isNaN(sequence)) {
        throw new ValidationError('Invalid ledger sequence number');
      }

      const ledger = await ledgerService.getLedgerBySequence(sequence);
      res.json(createSuccessResponse(ledger));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/ledgers/:sequence/transactions
   */
  router.get('/:sequence/transactions', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sequence = parseInt(req.params.sequence, 10);
      if (isNaN(sequence)) {
        throw new ValidationError('Invalid ledger sequence number');
      }

      const txs = await txService.getTransactionsByLedger(sequence);
      res.json(createSuccessResponse(txs));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
