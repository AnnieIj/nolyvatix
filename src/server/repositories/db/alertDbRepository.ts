import { eq, and, desc } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { alertRules, notificationHistory } from '../../../db/schema.ts';
import { AlertRule } from '../../../types/index.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('AlertDbRepository');

export class AlertDbRepository {
  async getAllAlerts(userId: number): Promise<AlertRule[]> {
    if (!db) return [];

    try {
      const records = await db
        .select()
        .from(alertRules)
        .where(eq(alertRules.userId, userId))
        .orderBy(desc(alertRules.createdAt));

      return records.map((r) => ({
        id: String(r.id),
        name: r.name,
        target: r.metricType as any,
        condition: r.condition as any,
        threshold: parseFloat(r.threshold) || 0,
        channel: ((r.channels as any)?.[0] || 'browser').toLowerCase(),
        enabled: r.isEnabled,
        lastTriggered: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
      }));
    } catch (error) {
      logger.error('Failed to fetch alerts from database', error);
      return [];
    }
  }

  async getAlertById(id: number | string, userId: number): Promise<AlertRule | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const records = await db
        .select()
        .from(alertRules)
        .where(and(eq(alertRules.id, numericId), eq(alertRules.userId, userId)))
        .limit(1);

      if (!records || records.length === 0) {
        logger.warn(`Tenant isolation block or not found: Alert ${numericId} for user ${userId}`);
        return null;
      }

      const r = records[0];
      return {
        id: String(r.id),
        name: r.name,
        target: r.metricType as any,
        condition: r.condition as any,
        threshold: parseFloat(r.threshold) || 0,
        channel: ((r.channels as any)?.[0] || 'browser').toLowerCase(),
        enabled: r.isEnabled,
        lastTriggered: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
      };
    } catch (error) {
      logger.error(`Failed to fetch alert by id: ${id}`, error);
      return null;
    }
  }

  async createAlert(userId: number, data: Partial<AlertRule>): Promise<AlertRule | null> {
    if (!db) return null;

    try {
      const inserted = await db
        .insert(alertRules)
        .values({
          userId,
          name: data.name || 'Untitled Trigger Alert',
          metricType: data.target || 'tps_drops',
          condition: data.condition || 'below',
          threshold: String(data.threshold ?? 0),
          severity: 'MEDIUM',
          channels: [data.channel?.toUpperCase() || 'BROWSER'],
          isEnabled: data.enabled ?? true,
        })
        .returning();

      const r = inserted[0];
      return {
        id: String(r.id),
        name: r.name,
        target: r.metricType as any,
        condition: r.condition as any,
        threshold: parseFloat(r.threshold) || 0,
        channel: ((r.channels as any)?.[0] || 'browser').toLowerCase(),
        enabled: r.isEnabled,
        lastTriggered: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
      };
    } catch (error) {
      logger.error('Failed to create alert in database', error);
      return null;
    }
  }

  async updateAlert(id: number | string, userId: number, updates: Partial<AlertRule>): Promise<AlertRule | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const valuesToUpdate: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (updates.name !== undefined) valuesToUpdate.name = updates.name;
      if (updates.target !== undefined) valuesToUpdate.metricType = updates.target;
      if (updates.condition !== undefined) valuesToUpdate.condition = updates.condition;
      if (updates.threshold !== undefined) valuesToUpdate.threshold = String(updates.threshold);
      if (updates.enabled !== undefined) valuesToUpdate.isEnabled = updates.enabled;
      if (updates.channel !== undefined) valuesToUpdate.channels = [updates.channel.toUpperCase()];

      const updated = await db
        .update(alertRules)
        .set(valuesToUpdate)
        .where(and(eq(alertRules.id, numericId), eq(alertRules.userId, userId)))
        .returning();

      if (!updated || updated.length === 0) {
        logger.warn(`Alert update failed: Alert ${numericId} not found or not owned by user ${userId}`);
        return null;
      }
      const r = updated[0];
      return {
        id: String(r.id),
        name: r.name,
        target: r.metricType as any,
        condition: r.condition as any,
        threshold: parseFloat(r.threshold) || 0,
        channel: ((r.channels as any)?.[0] || 'browser').toLowerCase(),
        enabled: r.isEnabled,
        lastTriggered: r.lastTriggeredAt ? r.lastTriggeredAt.toISOString() : undefined,
      };
    } catch (error) {
      logger.error(`Failed to update alert ${id}`, error);
      return null;
    }
  }

  async deleteAlert(id: number | string, userId: number): Promise<boolean> {
    if (!db) return false;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return false;

    try {
      const deleted = await db
        .delete(alertRules)
        .where(and(eq(alertRules.id, numericId), eq(alertRules.userId, userId)))
        .returning();

      return deleted && deleted.length > 0;
    } catch (error) {
      logger.error(`Failed to delete alert ${id}`, error);
      return false;
    }
  }
}
