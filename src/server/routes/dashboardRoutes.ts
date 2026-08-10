/**
 * Nolyvatix Express API Routes - Dashboard Builder API
 */

import { Router } from 'express';
import { DashboardService } from '../services/dashboardService.js';
import { sendSuccess, sendError } from '../middleware/responseWrapper.js';

export function createDashboardRouter(dashboardService: DashboardService): Router {
  const router = Router();

  // GET /api/dashboards
  router.get('/', async (_req, res, next) => {
    try {
      const dashboards = await dashboardService.getAllDashboards();
      sendSuccess(res, dashboards);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/dashboards/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const dashboard = await dashboardService.getDashboardById(req.params.id);
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
      const created = await dashboardService.createDashboard(req.body);
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/dashboards/:id
  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await dashboardService.updateDashboard(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/dashboards/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const success = await dashboardService.deleteDashboard(req.params.id);
      if (!success) {
        sendError(res, `Dashboard ${req.params.id} not found`, 404);
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
      const duplicated = await dashboardService.duplicateDashboard(req.params.id);
      sendSuccess(res, duplicated, 201);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/dashboards/:id/pin
  router.post('/:id/pin', async (req, res, next) => {
    try {
      const pinned = await dashboardService.togglePinDashboard(req.params.id);
      sendSuccess(res, pinned);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
