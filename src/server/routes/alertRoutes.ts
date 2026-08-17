/**
 * Nolyvatix Express API Routes - Alert & Webhook Center API
 * Enforces tenant-isolated ownership and operation validation
 */

import { Router } from 'express';
import { AlertService } from '../services/alertService.ts';
import { sendSuccess, sendError } from '../middleware/responseWrapper.ts';

export function createAlertRouter(alertService: AlertService): Router {
  const router = Router();

  // GET /api/alerts
  router.get('/', async (req, res, next) => {
    try {
      const alerts = await alertService.getAllAlerts(req.user?.id);
      sendSuccess(res, alerts);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/alerts/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const alert = await alertService.getAlertById(req.params.id, req.user?.id);
      if (!alert) {
        sendError(res, `Alert rule ${req.params.id} not found`, 404);
        return;
      }
      sendSuccess(res, alert);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/alerts
  router.post('/', async (req, res, next) => {
    try {
      const created = await alertService.createAlert(req.body, req.user?.id);
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/alerts/:id
  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await alertService.updateAlert(req.params.id, req.body, req.user?.id);
      sendSuccess(res, updated);
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('unauthorized')) {
        sendError(res, `Alert rule ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      next(err);
    }
  });

  // DELETE /api/alerts/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const success = await alertService.deleteAlert(req.params.id, req.user?.id);
      if (!success) {
        sendError(res, `Alert rule ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      sendSuccess(res, { deleted: true, id: req.params.id });
    } catch (err) {
      next(err);
    }
  });

  // POST /api/alerts/:id/test-trigger
  router.post('/:id/test-trigger', async (req, res, next) => {
    try {
      const result = await alertService.testTriggerAlert(req.params.id, req.user?.id);
      sendSuccess(res, result);
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('unauthorized')) {
        sendError(res, `Alert rule ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      next(err);
    }
  });

  return router;
}
