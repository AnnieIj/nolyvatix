/**
 * Nolyvatix Data Engine - AI Express Routes (/api/ai)
 */

import { Router, Request, Response, NextFunction } from 'express';
import { AiService } from '../services/aiService.js';
import { createSuccessResponse } from '../middleware/responseWrapper.js';
import { ValidationError } from '../utils/errors.js';

export function createAiRouter(aiService: AiService): Router {
  const router = Router();

  /**
   * POST /api/ai/chat
   * Chat/Query Endpoint for Natural Language BI Queries
   */
  const handleChat = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { prompt, history } = req.body || {};
      if (!prompt || typeof prompt !== 'string') {
        throw new ValidationError('Missing or invalid "prompt" parameter in request body');
      }

      const response = await aiService.processChatQuery(prompt, history || []);
      res.json(createSuccessResponse(response));
    } catch (err) {
      next(err);
    }
  };

  router.post('/chat', handleChat);
  router.post('/query', handleChat); // Backward compatibility alias

  /**
   * POST /api/ai/summary
   * Executive Summary Report Generator (daily / weekly / monthly)
   */
  router.post('/summary', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { period } = req.body || {};
      const validPeriod = ['daily', 'weekly', 'monthly'].includes(period) ? period : 'daily';
      const summary = await aiService.generateExecutiveSummary(validPeriod as any);
      res.json(createSuccessResponse(summary));
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/ai/chart
   * Natural Language Chart Visualizer Endpoint
   */
  router.post('/chart', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { query } = req.body || {};
      if (!query || typeof query !== 'string') {
        throw new ValidationError('Missing or invalid "query" parameter for chart generation');
      }

      const chartData = await aiService.generateChart(query);
      res.json(createSuccessResponse(chartData));
    } catch (err) {
      next(err);
    }
  });

  /**
   * GET /api/ai/recommendations
   * Get AI-generated ecosystem insights and recommendations
   */
  router.get('/recommendations', async (_req: Request, res: Response, next: NextFunction) => {
    try {
      const recommendations = await aiService.generateRecommendations();
      res.json(createSuccessResponse(recommendations));
    } catch (err) {
      next(err);
    }
  });

  /**
   * POST /api/ai/explain
   * Deep AI Explainer for Entity (Wallet, Asset, DEX, Soroban)
   */
  router.post('/explain', async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { type, identifier } = req.body || {};
      if (!type || !['wallet', 'asset', 'dex', 'soroban'].includes(type)) {
        throw new ValidationError('Invalid or missing "type" parameter. Allowed: wallet, asset, dex, soroban');
      }
      if (!identifier || typeof identifier !== 'string') {
        throw new ValidationError('Missing or invalid "identifier" parameter');
      }

      const explanation = await aiService.explainEntity(type as any, identifier);
      res.json(createSuccessResponse(explanation));
    } catch (err) {
      next(err);
    }
  });

  return router;
}
