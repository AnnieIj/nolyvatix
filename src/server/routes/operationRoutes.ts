/**
 * Nolyvatix Data Engine - Operation Routes (/api/operations)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { OperationService } from '../services/operationService.ts';
import { createSuccessResponse, createPaginatedResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createOperationRouter(opService: OperationService): Router {
  const router = Router();

  /**
   * GET /api/operations
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const ops = await opService.getOperations({ cursor, order, limit });
      const nextCursor = ops.length > 0 ? ops[ops.length - 1].id : undefined;

      res.json(
        createPaginatedResponse(ops, {
          cursor,
          nextCursor,
          limit,
          hasMore: ops.length === limit,
        })
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/operations/:id
   */
  router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const id = req.params.id;
      if (!id) {
        throw new ValidationError('Operation ID is required');
      }

      const op = await opService.getOperationById(id);
      res.json(createSuccessResponse(op));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
