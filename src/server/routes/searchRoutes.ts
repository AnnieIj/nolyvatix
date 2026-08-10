/**
 * Nolyvatix Express API Routes - Universal Search Intelligence API
 * Routes: unified search, search history
 */

import { Router } from 'express';
import { SearchService } from '../services/searchService.js';
import { sendSuccess } from '../middleware/responseWrapper.js';

export function createSearchRouter(searchService: SearchService): Router {
  const router = Router();

  // GET /api/search?q=...
  router.get('/', async (req, res, next) => {
    try {
      const query = (req.query.q as string) || '';
      const results = await searchService.universalSearch(query);
      sendSuccess(res, results);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/search/history — recent search queries from workspace
  router.get('/history', async (_req, res, next) => {
    try {
      const history = await searchService.getSearchHistory();
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
