/**
 * Nolyvatix Express API Routes - Dashboard Builder API
 * Enforces tenant-isolated ownership and operation validation
 */

import { Router } from 'express';
import { DashboardService } from '../services/dashboardService.ts';
import { sendSuccess, sendError } from '../middleware/responseWrapper.ts';

export function createDashboardRouter(dashboardService: DashboardService): Router {
  const router = Router();

  // GET /api/dashboards
  router.get('/', async (req, res, next) => {
    try {
      const dashboards = await dashboardService.getAllDashboards(req.user?.id);
      sendSuccess(res, dashboards);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/dashboards/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const dashboard = await dashboardService.getDashboardById(req.params.id, req.user?.id);
      if (!dashboard) {
        sendError(res, `Dashboard ${req.params.id} not found`, 404);
        return;
      }
      sendSuccess(res, dashboard);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/dashboards
  router.post('/', async (req, res, next) => {
    try {
      const created = await dashboardService.createDashboard(req.body, req.user?.id);
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/dashboards/:id
  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await dashboardService.updateDashboard(req.params.id, req.body, req.user?.id);
      sendSuccess(res, updated);
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('unauthorized')) {
        sendError(res, `Dashboard ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      next(err);
    }
  });

  // DELETE /api/dashboards/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const success = await dashboardService.deleteDashboard(req.params.id, req.user?.id);
      if (!success) {
        sendError(res, `Dashboard ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      sendSuccess(res, { deleted: true, id: req.params.id });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/dashboards/:id/duplicate
  router.post('/:id/duplicate', async (req, res, next) => {
    try {
      const duplicated = await dashboardService.duplicateDashboard(req.params.id, req.user?.id);
      sendSuccess(res, duplicated, 201);
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        sendError(res, `Dashboard ${req.params.id} not found`, 404);
        return;
      }
      next(err);
    }
  });

  // POST /api/dashboards/:id/pin
  router.post('/:id/pin', async (req, res, next) => {
    try {
      const pinned = await dashboardService.togglePinDashboard(req.params.id, req.user?.id);
      sendSuccess(res, pinned);
    } catch (err: any) {
      if (err?.message?.includes('not found')) {
        sendError(res, `Dashboard ${req.params.id} not found`, 404);
        return;
      }
      next(err);
    }
  });

  return router;
}
