/**
 * Nolyvatix Express API Routes - Alert & Webhook Center API
 */

import { Router } from 'express';
import { AlertService } from '../services/alertService.js';
import { sendSuccess, sendError } from '../middleware/responseWrapper.js';

export function createAlertRouter(alertService: AlertService): Router {
  const router = Router();

  // GET /api/alerts
  router.get('/', async (_req, res, next) => {
    try {
      const alerts = await alertService.getAllAlerts();
      sendSuccess(res, alerts);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/alerts/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const alert = await alertService.getAlertById(req.params.id);
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
      const created = await alertService.createAlert(req.body);
      sendSuccess(res, created, 201);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/alerts/:id
  router.put('/:id', async (req, res, next) => {
    try {
      const updated = await alertService.updateAlert(req.params.id, req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/alerts/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const success = await alertService.deleteAlert(req.params.id);
      if (!success) {
        sendError(res, `Alert rule ${req.params.id} not found`, 404);
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
      const result = await alertService.testTriggerAlert(req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
