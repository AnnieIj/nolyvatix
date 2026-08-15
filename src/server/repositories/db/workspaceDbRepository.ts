import { eq, desc } from 'drizzle-orm';
import { db } from '../../../db/index.ts';
import { bookmarks, savedSearches, workspacePreferences } from '../../../db/schema.ts';
import { UserWorkspace } from '../../../types/index.ts';
import { Logger } from '../../utils/logger.ts';

const logger = new Logger('WorkspaceDbRepository');

export class WorkspaceDbRepository {
  async getWorkspace(userId: number): Promise<UserWorkspace | null> {
    if (!db) return null;

    try {
      // 1. Fetch bookmarks
      const bookmarkRecords = await db.select().from(bookmarks).where(eq(bookmarks.userId, userId));
      // 2. Fetch searches
      const searchRecords = await db
        .select()
        .from(savedSearches)
        .where(eq(savedSearches.userId, userId))
        .orderBy(desc(savedSearches.lastUsedAt))
        .limit(10);

      const pinnedAssets: string[] = [];
      const pinnedWallets: string[] = [];
      const pinnedContracts: string[] = [];
      const favoriteDashboards: string[] = [];

      bookmarkRecords.forEach((b) => {
        if (b.itemType === 'ASSET') pinnedAssets.push(b.itemId);
        else if (b.itemType === 'ACCOUNT' || b.itemType === 'WALLET') pinnedWallets.push(b.itemId);
        else if (b.itemType === 'CONTRACT') pinnedContracts.push(b.itemId);
        else if (b.itemType === 'DASHBOARD') favoriteDashboards.push(b.itemId);
      });

      return {
        favoriteDashboards,
        recentReports: ['rep-default-24h'],
        savedAIConversations: [
          { id: 'chat-1', title: 'Soroban WASM CPU Gas Optimization Analysis', timestamp: new Date().toISOString() },
          { id: 'chat-2', title: 'Circle USDC Corridor Liquidity Audit', timestamp: new Date(Date.now() - 86400000).toISOString() },
        ],
        pinnedAssets,
        pinnedWallets,
        pinnedContracts,
        recentSearches: searchRecords.map((s) => s.query),
      };
    } catch (error) {
      logger.error('Failed to fetch workspace from database', error);
      return null;
    }
  }

  async togglePin(
    userId: number,
    category: 'dashboards' | 'assets' | 'wallets' | 'contracts',
    itemId: string
  ): Promise<boolean> {
    if (!db) return false;

    const itemTypeMap: Record<string, string> = {
      dashboards: 'DASHBOARD',
      assets: 'ASSET',
      wallets: 'WALLET',
      contracts: 'CONTRACT',
    };
    const itemType = itemTypeMap[category] || 'GENERIC';

    try {
      const existing = await db
        .select()
        .from(bookmarks)
        .where(eq(bookmarks.userId, userId))
        .limit(50);

      const match = existing.find((b) => b.itemType === itemType && b.itemId === itemId);
      if (match) {
        await db.delete(bookmarks).where(eq(bookmarks.id, match.id));
        return false; // unpinned
      } else {
        await db.insert(bookmarks).values({
          userId,
          itemType,
          itemId,
          label: itemId,
        });
        return true; // pinned
      }
    } catch (error) {
      logger.error(`Failed to toggle pin in database for ${category}:${itemId}`, error);
      return false;
    }
  }

  async addRecentSearch(userId: number, query: string): Promise<void> {
    if (!db || !query.trim()) return;

    try {
      await db.insert(savedSearches).values({
        userId,
        query: query.trim(),
        filterCategory: 'ALL',
      });
    } catch (error) {
      logger.error(`Failed to record search query: ${query}`, error);
    }
  }
}
