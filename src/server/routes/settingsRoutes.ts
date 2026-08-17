/**
 * Nolyvatix Express API Routes - Platform Settings API
 * Enforces tenant-isolated user settings
 */

import { Router } from 'express';
import { SettingsService } from '../services/settingsService.ts';
import { sendSuccess } from '../middleware/responseWrapper.ts';

export function createSettingsRouter(settingsService: SettingsService): Router {
  const router = Router();

  // GET /api/settings
  router.get('/', async (req, res, next) => {
    try {
      const settings = await settingsService.getSettings(req.user?.id);
      sendSuccess(res, settings);
    } catch (err) {
      next(err);
    }
  });

  // PUT /api/settings
  router.put('/', async (req, res, next) => {
    try {
      const updated = await settingsService.updateSettings(req.body, req.user?.id);
      sendSuccess(res, updated);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
