import { eq, and, desc, or } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { dashboards } from '../../../db/schema.ts';
import { CustomDashboard } from '../../../types/index.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('DashboardDbRepository');

export class DashboardDbRepository {
  async getAllDashboards(userId?: number): Promise<CustomDashboard[]> {
    if (!db) {
      return [];
    }

    try {
      let query;
      if (userId !== undefined) {
        query = db
          .select()
          .from(dashboards)
          .where(or(eq(dashboards.userId, userId), eq(dashboards.isDefault, true)))
          .orderBy(desc(dashboards.isDefault), desc(dashboards.updatedAt));
      } else {
        query = db
          .select()
          .from(dashboards)
          .where(eq(dashboards.isDefault, true))
          .orderBy(desc(dashboards.updatedAt));
      }

      const records = await query;

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

  async getDashboardById(id: number | string, userId?: number): Promise<CustomDashboard | null> {
    if (!db) return null;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return null;

    try {
      const records = await db.select().from(dashboards).where(eq(dashboards.id, numericId)).limit(1);
      if (!records || records.length === 0) return null;

      const r = records[0];
      // Multi-tenant check: allow if owned by user or if it's a default/system template
      if (userId !== undefined && r.userId !== userId && !r.isDefault) {
        logger.warn(`Tenant isolation block: User ${userId} attempted to access Dashboard ${numericId} owned by User ${r.userId}`);
        return null;
      }

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

  async updateDashboard(id: number | string, userId: number, updates: Partial<CustomDashboard>): Promise<CustomDashboard | null> {
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
        .where(and(eq(dashboards.id, numericId), eq(dashboards.userId, userId)))
        .returning();

      if (!updated || updated.length === 0) {
        logger.warn(`Dashboard update failed: Dashboard ${numericId} not found or not owned by user ${userId}`);
        return null;
      }
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

  async deleteDashboard(id: number | string, userId: number): Promise<boolean> {
    if (!db) return false;
    const numericId = typeof id === 'string' ? parseInt(id.replace(/\D/g, ''), 10) : id;
    if (isNaN(numericId)) return false;

    try {
      const deleted = await db
        .delete(dashboards)
        .where(and(eq(dashboards.id, numericId), eq(dashboards.userId, userId)))
        .returning();

      return deleted && deleted.length > 0;
    } catch (error) {
      logger.error(`Failed to delete dashboard ${id}`, error);
      return false;
    }
  }

  async duplicateDashboard(id: number | string, userId: number): Promise<CustomDashboard | null> {
    if (!db) return null;
    const original = await this.getDashboardById(id, userId);
    if (!original) return null;

    return this.createDashboard(userId, {
      title: `${original.title} (Copy)`,
      description: original.description,
      widgets: original.widgets,
      isPinned: false,
    });
  }

  async togglePin(id: number | string, userId: number): Promise<CustomDashboard | null> {
    if (!db) return null;
    const original = await this.getDashboardById(id, userId);
    if (!original) return null;

    return this.updateDashboard(id, userId, {
      isPinned: !original.isPinned,
    });
  }
}
