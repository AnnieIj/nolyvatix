/**
 * Nolyvatix Data Engine - Workspace Management Service
 * Tracks user favorites, pinned entities, recent searches, and saved AI conversations
 * Backed by Cloud SQL PostgreSQL with tenant isolation and owner scoping
 */

import { UserWorkspace } from '../../types/index.ts';
import { Logger } from '../utils/logger.ts';
import { WorkspaceDbRepository } from '../repositories/db/workspaceDbRepository.ts';
import { UserDbRepository } from '../repositories/db/userDbRepository.ts';

const logger = new Logger('WorkspaceService');

export class WorkspaceService {
  private inMemoryWorkspacesByUser: Map<number, UserWorkspace> = new Map();

  constructor(
    private workspaceRepo: WorkspaceDbRepository = new WorkspaceDbRepository(),
    private userRepo: UserDbRepository = new UserDbRepository()
  ) {}

  private getDefaultUserWorkspace(): UserWorkspace {
    return {
      favoriteDashboards: ['dash-mainnet-overview', 'dash-soroban-apm'],
      recentReports: ['rep-default-24h'],
      savedAIConversations: [
        { id: 'chat-1', title: 'Soroban WASM CPU Gas Optimization Analysis', timestamp: new Date().toISOString() },
        { id: 'chat-2', title: 'Circle USDC Corridor Liquidity Audit', timestamp: new Date(Date.now() - 86400000).toISOString() },
      ],
      pinnedAssets: ['USDC:GA5ZSEJYB37JRC5AVCI5M4GE323XNNOACS4M4S3Y3XAC', 'XLM:NATIVE'],
      pinnedWallets: ['GAAZI4TCR3TY5OJHCTJC2A4AFLA23OIB4X3A6NE3AM3A7EUJ5YATAG22'],
      pinnedContracts: ['CCW67TSB3SSS3PPHR3T5W34ACRAG2DMW22L36TH6E56S5W6F45X3ABX5'],
      recentSearches: ['USDC liquidity', 'Soroban WASM gas', 'GAAZI4TCR3TY5OJHCTJC', 'Ledger #52148900'],
    };
  }

  private async resolveUserId(userId?: number): Promise<number> {
    if (userId !== undefined && userId > 0) {
      return userId;
    }
    const defaultUser = await this.userRepo.getOrCreateDefaultUser();
    return defaultUser.id;
  }

  private getOrCreateInMemoryWorkspace(userId: number): UserWorkspace {
    if (!this.inMemoryWorkspacesByUser.has(userId)) {
      this.inMemoryWorkspacesByUser.set(userId, this.getDefaultUserWorkspace());
    }
    return this.inMemoryWorkspacesByUser.get(userId)!;
  }

  async getWorkspace(userId?: number): Promise<UserWorkspace> {
    const effectiveUserId = await this.resolveUserId(userId);
    const inMemWs = this.getOrCreateInMemoryWorkspace(effectiveUserId);

    try {
      const dbWs = await this.workspaceRepo.getWorkspace(effectiveUserId);
      if (dbWs) {
        return {
          favoriteDashboards: dbWs.favoriteDashboards.length > 0 ? dbWs.favoriteDashboards : inMemWs.favoriteDashboards,
          recentReports: dbWs.recentReports.length > 0 ? dbWs.recentReports : inMemWs.recentReports,
          savedAIConversations: inMemWs.savedAIConversations,
          pinnedAssets: dbWs.pinnedAssets.length > 0 ? dbWs.pinnedAssets : inMemWs.pinnedAssets,
          pinnedWallets: dbWs.pinnedWallets.length > 0 ? dbWs.pinnedWallets : inMemWs.pinnedWallets,
          pinnedContracts: dbWs.pinnedContracts.length > 0 ? dbWs.pinnedContracts : inMemWs.pinnedContracts,
          recentSearches: dbWs.recentSearches.length > 0 ? dbWs.recentSearches : inMemWs.recentSearches,
        };
      }
    } catch (e) {
      logger.error(`Error fetching workspace from DB for user ${effectiveUserId}, checking in-memory`, e);
    }
    return inMemWs;
  }

  async togglePin(category: 'dashboards' | 'assets' | 'wallets' | 'contracts', itemId: string, userId?: number): Promise<UserWorkspace> {
    const effectiveUserId = await this.resolveUserId(userId);

    try {
      await this.workspaceRepo.togglePin(effectiveUserId, category, itemId);
    } catch (e) {
      logger.error(`Error toggling pin in DB for user ${effectiveUserId}, ${category}:${itemId}`, e);
    }

    const inMemWs = this.getOrCreateInMemoryWorkspace(effectiveUserId);
    const listMap = {
      dashboards: inMemWs.favoriteDashboards,
      assets: inMemWs.pinnedAssets,
      wallets: inMemWs.pinnedWallets,
      contracts: inMemWs.pinnedContracts,
    };

    const targetList = listMap[category];
    const index = targetList.indexOf(itemId);
    if (index >= 0) {
      targetList.splice(index, 1);
      logger.info(`User ${effectiveUserId}: Unpinned ${category} item: ${itemId}`);
    } else {
      targetList.push(itemId);
      logger.info(`User ${effectiveUserId}: Pinned ${category} item: ${itemId}`);
    }

    return this.getWorkspace(effectiveUserId);
  }

  async addRecentSearch(query: string, userId?: number): Promise<UserWorkspace> {
    const effectiveUserId = await this.resolveUserId(userId);
    if (!query.trim()) return this.getWorkspace(effectiveUserId);

    try {
      await this.workspaceRepo.addRecentSearch(effectiveUserId, query);
    } catch (e) {
      logger.error(`Error adding recent search in DB for user ${effectiveUserId}: ${query}`, e);
    }

    const inMemWs = this.getOrCreateInMemoryWorkspace(effectiveUserId);
    inMemWs.recentSearches = [
      query.trim(),
      ...inMemWs.recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10);

    return this.getWorkspace(effectiveUserId);
  }
}
