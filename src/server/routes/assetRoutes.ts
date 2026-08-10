/**
 * Nolyvatix Data Engine - Asset Routes (/api/assets)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/assetService.ts';
import { createSuccessResponse, createPaginatedResponse } from '../middleware/responseWrapper.ts';

export function createAssetRouter(assetService: AssetService): Router {
  const router = Router();

  /**
   * GET /api/assets/summary
   */
  router.get('/summary', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const summary = await assetService.getAssetSummary();
      res.json(createSuccessResponse(summary));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/assets/orderbook
   * Query: selling_type, selling_code, selling_issuer, buying_type, buying_code, buying_issuer, limit
   */
  router.get('/orderbook', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sellingType = (req.query.selling_type as string) || (req.query.sellingType as string) || 'native';
      const sellingCode = req.query.selling_code as string | undefined;
      const sellingIssuer = req.query.selling_issuer as string | undefined;

      const buyingType = (req.query.buying_type as string) || (req.query.buyingType as string) || 'credit_alphanum4';
      const buyingCode = (req.query.buying_code as string) || 'USDC';
      const buyingIssuer = (req.query.buying_issuer as string) || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const orderbook = await assetService.getOrderBook(
        { type: sellingType, code: sellingCode, issuer: sellingIssuer },
        { type: buyingType, code: buyingCode, issuer: buyingIssuer },
        limit
      );

      res.json(createSuccessResponse(orderbook));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/assets/trades
   * Query: base_type, base_code, base_issuer, counter_type, counter_code, counter_issuer, limit
   */
  router.get('/trades', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const baseType = (req.query.base_type as string) || 'native';
      const baseCode = req.query.base_code as string | undefined;
      const baseIssuer = req.query.base_issuer as string | undefined;

      const counterType = (req.query.counter_type as string) || 'credit_alphanum4';
      const counterCode = (req.query.counter_code as string) || 'USDC';
      const counterIssuer = (req.query.counter_issuer as string) || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const trades = await assetService.getTrades({
        baseType,
        baseCode,
        baseIssuer,
        counterType,
        counterCode,
        counterIssuer,
        limit,
      });

      res.json(createSuccessResponse(trades));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/assets/trade-aggregations
   * Query: base_type, base_code, base_issuer, counter_type, counter_code, counter_issuer, resolution, limit
   */
  router.get('/trade-aggregations', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const baseType = (req.query.base_type as string) || 'native';
      const baseCode = req.query.base_code as string | undefined;
      const baseIssuer = req.query.base_issuer as string | undefined;

      const counterType = (req.query.counter_type as string) || 'credit_alphanum4';
      const counterCode = (req.query.counter_code as string) || 'USDC';
      const counterIssuer = (req.query.counter_issuer as string) || 'GA5ZSEJYB37JRC5AVCIA5MOP4RHTM335X2KGX3IHOJAPP5RE34K4KZVN';

      const resolution = req.query.resolution ? parseInt(req.query.resolution as string, 10) : 86400000;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 14;

      const aggs = await assetService.getTradeAggregations({
        baseType,
        baseCode,
        baseIssuer,
        counterType,
        counterCode,
        counterIssuer,
        resolution,
        limit,
      });

      res.json(createSuccessResponse(aggs));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/assets
   * Query params: code, issuer, cursor, order, limit
   */
  router.get('/', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const code = req.query.code as string | undefined;
      const issuer = req.query.issuer as string | undefined;
      const cursor = req.query.cursor as string | undefined;
      const order = (req.query.order as 'asc' | 'desc') || 'desc';
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 20;

      const assets = await assetService.getAssets(code, issuer, { cursor, order, limit });
      const nextCursor = assets.length > 0 ? assets[assets.length - 1].pagingToken : undefined;

      res.json(
        createPaginatedResponse(assets, {
          cursor,
          nextCursor,
          limit,
          hasMore: assets.length === limit,
        })
      );
    } catch (err) {
      next(err);
    }
  });

  return router;
}
