/**
 * Nolyvatix Data Engine - Network Routes (/api/network)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { NetworkService } from '../services/networkService.ts';
import { createSuccessResponse } from '../middleware/responseWrapper.ts';
import { ValidationError } from '../utils/errors.ts';

export function createNetworkRouter(networkService: NetworkService): Router {
  const router = Router();

  /**
   * GET /api/network/health
   */
  router.get('/health', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const health = await networkService.getNetworkHealth();
      res.json(createSuccessResponse(health));
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/network/switch
   */
  router.post('/switch', (req: Request, res: Response, next: NextFunction) => {
    try {
      const { network } = req.body || {};
      if (!network || !['mainnet', 'testnet', 'futurenet'].includes(network)) {
        throw new ValidationError('Invalid or missing network parameter. Allowed: mainnet, testnet, futurenet');
      }

      networkService.setNetwork(network);
      res.json(createSuccessResponse({ activeNetwork: network }));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
