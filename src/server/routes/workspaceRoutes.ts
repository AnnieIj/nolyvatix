/**
 * Nolyvatix Express API Routes - Workspace Management API
 * Enforces tenant-isolated ownership and operation validation
 */

import { Router } from 'express';
import { WorkspaceService } from '../services/workspaceService.ts';
import { sendSuccess } from '../middleware/responseWrapper.ts';

export function createWorkspaceRouter(workspaceService: WorkspaceService): Router {
  const router = Router();

  // GET /api/workspaces
  router.get('/', async (req, res, next) => {
    try {
      const workspace = await workspaceService.getWorkspace(req.user?.id);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces/pin
  router.post('/pin', async (req, res, next) => {
    try {
      const { category, itemId } = req.body;
      const workspace = await workspaceService.togglePin(category, itemId, req.user?.id);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces/recent-search
  router.post('/recent-search', async (req, res, next) => {
    try {
      const { query } = req.body;
      const workspace = await workspaceService.addRecentSearch(query, req.user?.id);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
