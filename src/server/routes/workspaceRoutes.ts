/**
 * Nolyvatix Express API Routes - Workspace Management API
 */

import { Router } from 'express';
import { WorkspaceService } from '../services/workspaceService.js';
import { sendSuccess } from '../middleware/responseWrapper.js';

export function createWorkspaceRouter(workspaceService: WorkspaceService): Router {
  const router = Router();

  // GET /api/workspaces
  router.get('/', async (_req, res, next) => {
    try {
      const workspace = await workspaceService.getWorkspace();
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces/pin
  router.post('/pin', async (req, res, next) => {
    try {
      const { category, itemId } = req.body;
      const workspace = await workspaceService.togglePin(category, itemId);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces/recent-search
  router.post('/recent-search', async (req, res, next) => {
    try {
      const { query } = req.body;
      const workspace = await workspaceService.addRecentSearch(query);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
