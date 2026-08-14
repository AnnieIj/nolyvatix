/**
 * Nolyvatix Data Engine - Server-Sent Events (SSE) Streaming Routes
 * Provides real-time event streaming for ledgers, transactions, TPS, prices, pools, and contracts.
 */

import { Router, Request, Response } from 'express';
import { StellarEventBus } from '../services/stellar/stellarEventBus.js';

export function createStreamRouter(eventBus: StellarEventBus): Router {
  const router = Router();

  const setupSSEHeaders = (res: Response) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache, no-transform');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); // Disable nginx proxy buffering
    res.flushHeaders?.();
  };

  /**
   * Main Multiplexed SSE Event Stream
   * GET /api/stream/events?topics=ledgers,transactions,tps,prices,pools,contracts,health
   */
  router.get('/events', (req: Request, res: Response) => {
    setupSSEHeaders(res);

    const clientId = `client_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const topicsParam = (req.query.topics as string) || 'all';
    const topics = topicsParam.split(',');

    eventBus.registerClient(clientId, res, topics);
  });

  /**
   * Specialized Ledger Stream
   * GET /api/stream/ledgers
   */
  router.get('/ledgers', (req: Request, res: Response) => {
    setupSSEHeaders(res);
    const clientId = `client_ledgers_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    eventBus.registerClient(clientId, res, ['ledgers', 'tps']);
  });

  /**
   * Specialized Transactions Stream
   * GET /api/stream/transactions
   */
  router.get('/transactions', (req: Request, res: Response) => {
    setupSSEHeaders(res);
    const clientId = `client_txs_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    eventBus.registerClient(clientId, res, ['transactions']);
  });

  /**
   * Specialized TPS & Network Telemetry Stream
   * GET /api/stream/tps
   */
  router.get('/tps', (req: Request, res: Response) => {
    setupSSEHeaders(res);
    const clientId = `client_tps_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    eventBus.registerClient(clientId, res, ['tps', 'health']);
  });

  /**
   * Specialized Asset & DEX Price Stream
   * GET /api/stream/prices
   */
  router.get('/prices', (req: Request, res: Response) => {
    setupSSEHeaders(res);
    const clientId = `client_prices_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    eventBus.registerClient(clientId, res, ['prices']);
  });

  /**
   * Specialized Liquidity Pools Stream
   * GET /api/stream/pools
   */
  router.get('/pools', (req: Request, res: Response) => {
    setupSSEHeaders(res);
    const clientId = `client_pools_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    eventBus.registerClient(clientId, res, ['pools']);
  });

  /**
   * Stream Metrics & Active Subscribers
   * GET /api/stream/metrics
   */
  router.get('/metrics', (_req: Request, res: Response) => {
    const metrics = eventBus.getMetrics();
    res.json({
      success: true,
      data: metrics,
    });
  });

  return router;
}
