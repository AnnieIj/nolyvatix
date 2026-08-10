/**
 * Nolyvatix Express API Routes - Report Builder API
 */

import { Router } from 'express';
import { ReportService } from '../services/reportService.js';
import { sendSuccess, sendError } from '../middleware/responseWrapper.js';

export function createReportRouter(reportService: ReportService): Router {
  const router = Router();

  // GET /api/reports
  router.get('/', async (_req, res, next) => {
    try {
      const reports = await reportService.getAllReports();
      sendSuccess(res, reports);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/reports/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const report = await reportService.getReportById(req.params.id);
      if (!report) {
        sendError(res, `Report ${req.params.id} not found`, 404);
        return;
      }
      sendSuccess(res, report);
    } catch (err) {
      next(err);
    }
  });

  // POST /api/reports/generate
  router.post('/generate', async (req, res, next) => {
    try {
      const { period, startDate, endDate, sections } = req.body;
      const report = await reportService.generateReport({
        period: period || 'daily',
        startDate,
        endDate,
        sections,
      });
      sendSuccess(res, report, 201);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/reports/:id/export
  router.get('/:id/export', async (req, res, next) => {
    try {
      const format = (req.query.format as 'pdf' | 'csv' | 'json' | 'markdown') || 'markdown';
      const result = await reportService.exportReport(req.params.id, format);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.status(200).send(result.data);
    } catch (err) {
      next(err);
    }
  });

  return router;
}
