/**
 * Nolyvatix Express API Routes - Platform Settings API
 */

import { Router } from 'express';
import { SettingsService } from '../services/settingsService.js';
import { sendSuccess } from '../middleware/responseWrapper.js';

export function createSettingsRouter(settingsService: SettingsService): Router {
  const router = Router();

  // GET /api/settings
  router.get('/', async (_req, res, next) => {
    try {
      const settings = await settingsService.getSettings();
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/settings
  router.put('/', async (req, res, next) => {
    try {
      const updated = await settingsService.updateSettings(req.body);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
