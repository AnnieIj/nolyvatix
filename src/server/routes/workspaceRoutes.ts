/**
 * Nolyvatix Express API Routes - Enterprise Workspace Management API
 * Routes: multi-workspace CRUD, pin/unpin, search history, AI conversations, share links
 */

import { Router } from 'express';
import { WorkspaceService } from '../services/workspaceService.js';
import { sendSuccess, sendError } from '../middleware/responseWrapper.js';

export function createWorkspaceRouter(workspaceService: WorkspaceService): Router {
  const router = Router();

  // ─────────────────────────────────────────────
  //  Multi-Workspace Management
  // ─────────────────────────────────────────────

  // GET /api/workspaces — list all workspaces
  router.get('/', async (_req, res, next) => {
    try {
      const workspaces = await workspaceService.getAllWorkspaces();
      sendSuccess(res, workspaces);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/workspaces/active — get current active workspace data
  router.get('/active', async (_req, res, next) => {
    try {
      const active = await workspaceService.getActiveWorkspace();
      sendSuccess(res, active);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces — create new workspace
  router.post('/', async (req, res, next) => {
    try {
      const { name, description, role } = req.body;
      if (!name) {
        sendError(res, 'Workspace name is required', 400);
        return;
      }
      const ws = await workspaceService.createWorkspace(name, description, role);
      sendSuccess(res, ws, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/workspaces/:id — update workspace metadata
  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await workspaceService.updateWorkspace(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/workspaces/:id — delete workspace
  router.delete('/:id', async (req, res, next) => {
    try {
      const success = await workspaceService.deleteWorkspace(req.params.id);
      if (!success) {
        sendError(res, `Workspace ${req.params.id} not found`, 404);
        return;
      }
      sendSuccess(res, { deleted: true, id: req.params.id });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/workspaces/:id/switch — switch active workspace
  router.post('/:id/switch', async (req, res, next) => {
    try {
      const ws = await workspaceService.switchWorkspace(req.params.id);
      sendSuccess(res, ws);
    } catch (err) {
      next(err);
    }
  });

  // ─────────────────────────────────────────────
  //  Shareable Links
  // ─────────────────────────────────────────────

  // POST /api/workspaces/:id/share — generate shareable read-only link
  router.post('/:id/share', async (req, res, next) => {
    try {
      const result = await workspaceService.generateShareLink(req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/workspaces/share/:token — resolve share token (viewer access)
  router.get('/share/:token', async (req, res, next) => {
    try {
      const ws = await workspaceService.resolveShareToken(req.params.token);
      if (!ws) {
        sendError(res, 'Invalid or expired share link', 404);
        return;
      }
      sendSuccess(res, ws);
    } catch (err) {
      next(err);
    }
  });

  // ─────────────────────────────────────────────
  //  Pin / Unpin
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  //  Search History
  // ─────────────────────────────────────────────

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

  // DELETE /api/workspaces/search-history — clear search history
  router.delete('/search-history', async (_req, res, next) => {
    try {
      const workspace = await workspaceService.clearSearchHistory();
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // ─────────────────────────────────────────────
  //  AI Conversations
  // ─────────────────────────────────────────────

  // POST /api/workspaces/ai-conversations
  router.post('/ai-conversations', async (req, res, next) => {
    try {
      const { title } = req.body;
      if (!title) {
        sendError(res, 'Title is required', 400);
        return;
      }
      const workspace = await workspaceService.saveAIConversation(title);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/workspaces/ai-conversations/:chatId
  router.delete('/ai-conversations/:chatId', async (req, res, next) => {
    try {
      const workspace = await workspaceService.removeAIConversation(req.params.chatId);
      sendSuccess(res, workspace);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
