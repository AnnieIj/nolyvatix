/**
 * Nolyvatix Express API Routes - Universal Search Center API
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

  return router;
}
