import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { reports } from '../../../db/schema.ts';
import { BIReport } from '../../../types/index.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('ReportDbRepository');

export class ReportDbRepository {
  async getAllReports(userId: number): Promise<BIReport[]> {
    if (!db) return [];

    try {
      const records = await db
        .select()
        .from(reports)
        .where(eq(reports.userId, userId))
        .orderBy(desc(reports.createdAt));

      return records.map((r) => {
        const config = (r.config as any) || {};
        return {
          id: String(r.id),
          title: r.title,
          period: (config.period as any) || 'daily',
          createdAt: r.createdAt.toISOString(),
          sections: config.sections || ['Executive Summary', 'Network Health', 'Wallet Analytics'],
          content: config.content || {},
        };
      });
    } catch (error) {
      logger.error('Failed to fetch reports from database', error);
      return [];
    }
  }

  async getReportById(id: number | string, userId: number): Promise<BIReport | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const records = await db
        .select()
        .from(reports)
        .where(and(eq(reports.id, numericId), eq(reports.userId, userId)))
        .limit(1);

      if (!records || records.length === 0) {
        logger.warn(`Tenant isolation block or not found: Report ${numericId} for user ${userId}`);
        return null;
      }

      const r = records[0];
      const config = (r.config as any) || {};
      return {
        id: String(r.id),
        title: r.title,
        period: (config.period as any) || 'daily',
        createdAt: r.createdAt.toISOString(),
        sections: config.sections || ['Executive Summary', 'Network Health', 'Wallet Analytics'],
        content: config.content || {},
      };
    } catch (error) {
      logger.error(`Failed to fetch report by id: ${id}`, error);
      return null;
    }
  }

  async createReport(userId: number, report: Partial<BIReport>): Promise<BIReport | null> {
    if (!db) return null;

    try {
      const inserted = await db
        .insert(reports)
        .values({
          userId,
          title: report.title || 'Stellar BI Report',
          description: 'User-generated analytical report',
          templateType: report.period?.toUpperCase() || 'DAILY',
          config: {
            period: report.period || 'daily',
            sections: report.sections || [],
            content: report.content || {},
          },
        })
        .returning();

      const r = inserted[0];
      const config = (r.config as any) || {};
      return {
        id: String(r.id),
        title: r.title,
        period: (config.period as any) || 'daily',
        createdAt: r.createdAt.toISOString(),
        sections: config.sections || [],
        content: config.content || {},
      };
    } catch (error) {
      logger.error('Failed to insert report into database', error);
      return null;
    }
  }

  async deleteReport(id: number | string, userId: number): Promise<boolean> {
    if (!db) return false;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return false;

    try {
      const deleted = await db
        .delete(reports)
        .where(and(eq(reports.id, numericId), eq(reports.userId, userId)))
        .returning();

      return deleted && deleted.length > 0;
    } catch (error) {
      logger.error(`Failed to delete report ${id}`, error);
      return false;
    }
  }
}
