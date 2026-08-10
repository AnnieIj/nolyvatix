/**
 * Nolyvatix Data Engine - Liquidity Pool Routes (/api/liquidity-pools)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { LiquidityPoolService } from '../services/liquidityPoolService.ts';
import { createSuccessResponse, createPaginatedResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createLiquidityPoolRouter(poolService: LiquidityPoolService): Router {
  const router = Router();

  /**
   * GET /api/liquidity-pools
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const cursor = req.query.cursor as string | undefined;
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const pools = await poolService.getLiquidityPools({ cursor, order, limit });
      const nextCursor = pools.length > 0 ? pools[pools.length - 1].pagingToken : undefined;

      res.json(
        createPaginatedResponse(pools, {
          cursor,
          nextCursor,
          limit,
          hasMore: pools.length === limit,
        })
      );
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/liquidity-pools/:poolId
   */
  router.get('/:poolId', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const poolId = req.params.poolId;
      if (!poolId || poolId.length < 10) {
        throw new ValidationError('Invalid liquidity pool ID format');
      }

      const pool = await poolService.getLiquidityPoolById(poolId);
      res.json(createSuccessResponse(pool));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
