import { eq, desc } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { dashboards } from '../../../db/schema.ts';
import { CustomDashboard } from '../../../types/index.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('DashboardDbRepository');

export class DashboardDbRepository {
  async getAllDashboards(userId: number): Promise<CustomDashboard[]> {
    if (!db) {
      return [];
    }

    try {
      const records = await db
        .select()
        .from(dashboards)
        .where(eq(dashboards.userId, userId))
        .orderBy(desc(dashboards.isDefault), desc(dashboards.updatedAt));

      return records.map((r) => ({
        id: String(r.id),
        title: r.title,
        description: r.description || '',
        isPinned: r.isDefault,
        isPublic: true,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        widgets: (r.widgets as any) || [],
      }));
    } catch (error) {
      logger.error('Failed to fetch dashboards from database', error);
      return [];
    }
  }

  async getDashboardById(id: number | string): Promise<CustomDashboard | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const records = await db.select().from(dashboards).where(eq(dashboards.id, numericId)).limit(1);
      if (!records || records.length === 0) return null;

      const r = records[0];
      return {
        id: String(r.id),
        title: r.title,
        description: r.description || '',
        isPinned: r.isDefault,
        isPublic: true,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        widgets: (r.widgets as any) || [],
      };
    } catch (error) {
      logger.error(`Failed to fetch dashboard by id: ${id}`, error);
      return null;
    }
  }

  async createDashboard(userId: number, data: Partial<CustomDashboard>): Promise<CustomDashboard | null> {
    if (!db) return null;

    try {
      const inserted = await db
        .insert(dashboards)
        .values({
          userId,
          title: data.title || 'Untitled BI Dashboard',
          description: data.description || '',
          isDefault: !!data.isPinned,
          widgets: data.widgets || [],
          layout: { columns: 3, rows: 'auto' },
        })
        .returning();

      const r = inserted[0];
      return {
        id: String(r.id),
        title: r.title,
        description: r.description || '',
        isPinned: r.isDefault,
        isPublic: true,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        widgets: (r.widgets as any) || [],
      };
    } catch (error) {
      logger.error('Failed to create dashboard in database', error);
      return null;
    }
  }

  async updateDashboard(id: number | string, updates: Partial<CustomDashboard>): Promise<CustomDashboard | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const valuesToUpdate: Record<string, any> = {
        updatedAt: new Date(),
      };
      if (updates.title !== undefined) valuesToUpdate.title = updates.title;
      if (updates.description !== undefined) valuesToUpdate.description = updates.description;
      if (updates.isPinned !== undefined) valuesToUpdate.isDefault = updates.isPinned;
      if (updates.widgets !== undefined) valuesToUpdate.widgets = updates.widgets;

      const updated = await db
        .update(dashboards)
        .set(valuesToUpdate)
        .where(eq(dashboards.id, numericId))
        .returning();

      if (!updated || updated.length === 0) return null;
      const r = updated[0];
      return {
        id: String(r.id),
        title: r.title,
        description: r.description || '',
        isPinned: r.isDefault,
        isPublic: true,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
        widgets: (r.widgets as any) || [],
      };
    } catch (error) {
      logger.error(`Failed to update dashboard ${id}`, error);
      return null;
    }
  }

  async deleteDashboard(id: number | string): Promise<boolean> {
    if (!db) return false;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return false;

    try {
      await db.delete(dashboards).where(eq(dashboards.id, numericId));
      return true;
    } catch (error) {
      logger.error(`Failed to delete dashboard ${id}`, error);
      return false;
    }
  }
}
