/**
 * Nolyvatix Express API Routes - Report Builder API
 * Enforces tenant-isolated ownership and operation validation
 */

import { Router } from 'express';
import { ReportService } from '../services/reportService.ts';
import { sendSuccess, sendError } from '../middleware/responseWrapper.ts';

export function createReportRouter(reportService: ReportService): Router {
  const router = Router();

  // GET /api/reports
  router.get('/', async (req, res, next) => {
    try {
      const reports = await reportService.getAllReports(req.user?.id);
      sendSuccess(res, reports);
    } catch (err) {
      next(err);
    }
  });

  // GET /api/reports/:id
  router.get('/:id', async (req, res, next) => {
    try {
      const report = await reportService.getReportById(req.params.id, req.user?.id);
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
      const report = await reportService.generateReport(
        {
          period: period || 'daily',
          startDate,
          endDate,
          sections,
        },
        req.user?.id
      );
      sendSuccess(res, report, 201);
    } catch (err) {
      next(err);
    }
  });

  // DELETE /api/reports/:id
  router.delete('/:id', async (req, res, next) => {
    try {
      const deleted = await reportService.deleteReport(req.params.id, req.user?.id);
      if (!deleted) {
        sendError(res, `Report ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      sendSuccess(res, { deleted: true, id: req.params.id });
    } catch (err) {
      next(err);
    }
  });

  // GET /api/reports/:id/export
  router.get('/:id/export', async (req, res, next) => {
    try {
      const format = (req.query.format as 'pdf' | 'csv' | 'json' | 'markdown') || 'markdown';
      const result = await reportService.exportReport(req.params.id, format, req.user?.id);
      res.setHeader('Content-Type', result.contentType);
      res.setHeader('Content-Disposition', `attachment; filename="${result.filename}"`);
      res.status(200).send(result.data);
    } catch (err: any) {
      if (err?.message?.includes('not found') || err?.message?.includes('unauthorized')) {
        sendError(res, `Report ${req.params.id} not found or unauthorized`, 404);
        return;
      }
      next(err);
    }
  });

  return router;
}
