/**
 * Nolyvatix Express API Routes - Enterprise Alert & Notification Center API
 * Routes: CRUD, history, acknowledgment, stats, test-trigger, evaluate
 */

import { Router } from 'express';
import { AlertService } from '../services/alertService.js';
import { sendSuccess, sendError } from '../middleware/responseWrapper.js';

export function createAlertRouter(alertService: AlertService): Router {
  const router = Router();

  // ─────────────────────────────────────────────
  //  Stats (must come before /:id to prevent shadowing)
  // ─────────────────────────────────────────────

  // GET /api/alerts/stats
  router.get('/stats', async (_req, res, next) => {
    try {
      const stats = await alertService.getAlertStats();
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  });

  // ─────────────────────────────────────────────
  //  History (global)
  // ─────────────────────────────────────────────

  // GET /api/alerts/history
  router.get('/history', async (_req, res, next) => {
    try {
      const history = await alertService.getAlertHistory();
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/alerts/history/:historyId/acknowledge
  router.post('/history/:historyId/acknowledge', async (req, res, next) => {
    try {
      const entry = await alertService.acknowledgeAlert(req.params.historyId);
      sendSuccess(res, entry);
    } catch (err) {
      next(err);
    }
  });

  // ─────────────────────────────────────────────
  //  Alert Rules CRUD
  // ─────────────────────────────────────────────

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

  // ─────────────────────────────────────────────
  //  Alert-specific History & Actions
  // ─────────────────────────────────────────────

  // GET /api/alerts/:id/history
  router.get('/:id/history', async (req, res, next) => {
    try {
      const history = await alertService.getAlertHistory(req.params.id);
      sendSuccess(res, history);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/alerts/:id/acknowledge-all
  router.post('/:id/acknowledge-all', async (req, res, next) => {
    try {
      const count = await alertService.acknowledgeAllForAlert(req.params.id);
      sendSuccess(res, { acknowledged: count, alertId: req.params.id });
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

  // POST /api/alerts/:id/evaluate
  router.post('/:id/evaluate', async (req, res, next) => {
    try {
      const { currentValue } = req.body as { currentValue: number };
      if (typeof currentValue !== 'number') {
        sendError(res, 'currentValue (number) is required in request body', 400);
        return;
      }
      const entry = await alertService.evaluateAndDispatch(req.params.id, currentValue);
      sendSuccess(res, { breached: entry !== null, entry });
    } catch (err) {
      next(err);
    }
  });

  return router;
}
