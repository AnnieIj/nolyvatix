/**
 * Nolyvatix Data Engine - Workspace Management Service
 * Tracks user favorites, pinned entities, recent searches, and saved AI conversations
 * Backed by Cloud SQL PostgreSQL with seamless in-memory fallback
 */

import { UserWorkspace } from '../../types/index.ts';
import { Logger } from '../utils/logger.ts';
import { WorkspaceDbRepository } from '../repositories/db/workspaceDbRepository.ts';
import { UserDbRepository } from '../repositories/db/userDbRepository.ts';

const logger = new Logger('WorkspaceService');

export class WorkspaceService {
  private inMemoryWorkspace: UserWorkspace = {
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

  constructor(
    private workspaceRepo: WorkspaceDbRepository = new WorkspaceDbRepository(),
    private userRepo: UserDbRepository = new UserDbRepository()
  ) {}

  async getWorkspace(): Promise<UserWorkspace> {
    try {
      const user = await this.userRepo.getOrCreateDefaultUser();
      const dbWs = await this.workspaceRepo.getWorkspace(user.id);
      if (dbWs) {
        // Merge with memory defaults if empty
        return {
          favoriteDashboards: dbWs.favoriteDashboards.length > 0 ? dbWs.favoriteDashboards : this.inMemoryWorkspace.favoriteDashboards,
          recentReports: dbWs.recentReports.length > 0 ? dbWs.recentReports : this.inMemoryWorkspace.recentReports,
          savedAIConversations: this.inMemoryWorkspace.savedAIConversations,
          pinnedAssets: dbWs.pinnedAssets.length > 0 ? dbWs.pinnedAssets : this.inMemoryWorkspace.pinnedAssets,
          pinnedWallets: dbWs.pinnedWallets.length > 0 ? dbWs.pinnedWallets : this.inMemoryWorkspace.pinnedWallets,
          pinnedContracts: dbWs.pinnedContracts.length > 0 ? dbWs.pinnedContracts : this.inMemoryWorkspace.pinnedContracts,
          recentSearches: dbWs.recentSearches.length > 0 ? dbWs.recentSearches : this.inMemoryWorkspace.recentSearches,
        };
      }
    } catch (e) {
      logger.error('Error fetching workspace from DB, checking in-memory', e);
    }
    return this.inMemoryWorkspace;
  }

  async togglePin(category: 'dashboards' | 'assets' | 'wallets' | 'contracts', itemId: string): Promise<UserWorkspace> {
    try {
      const user = await this.userRepo.getOrCreateDefaultUser();
      await this.workspaceRepo.togglePin(user.id, category, itemId);
    } catch (e) {
      logger.error(`Error toggling pin in DB for ${category}:${itemId}`, e);
    }

    const listMap = {
      dashboards: this.inMemoryWorkspace.favoriteDashboards,
      assets: this.inMemoryWorkspace.pinnedAssets,
      wallets: this.inMemoryWorkspace.pinnedWallets,
      contracts: this.inMemoryWorkspace.pinnedContracts,
    };

    const targetList = listMap[category];
    const index = targetList.indexOf(itemId);
    if (index >= 0) {
      targetList.splice(index, 1);
      logger.info(`Unpinned ${category} item: ${itemId}`);
    } else {
      targetList.push(itemId);
      logger.info(`Pinned ${category} item: ${itemId}`);
    }

    return this.getWorkspace();
  }

  async addRecentSearch(query: string): Promise<UserWorkspace> {
    if (!query.trim()) return this.getWorkspace();

    try {
      const user = await this.userRepo.getOrCreateDefaultUser();
      await this.workspaceRepo.addRecentSearch(user.id, query);
    } catch (e) {
      logger.error(`Error adding recent search in DB: ${query}`, e);
    }

    this.inMemoryWorkspace.recentSearches = [
      query.trim(),
      ...this.inMemoryWorkspace.recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10);

    return this.getWorkspace();
  }
}
