/**
 * Nolyvatix Data Engine - Workspace Management Service
 * Tracks user favorites, pinned entities, recent searches, and saved AI conversations
 */

import { UserWorkspace } from '../../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('WorkspaceService');

export class WorkspaceService {
  private workspace: UserWorkspace = {
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

  async getWorkspace(): Promise<UserWorkspace> {
    return this.workspace;
  }

  async togglePin(category: 'dashboards' | 'assets' | 'wallets' | 'contracts', itemId: string): Promise<UserWorkspace> {
    const listMap = {
      dashboards: this.workspace.favoriteDashboards,
      assets: this.workspace.pinnedAssets,
      wallets: this.workspace.pinnedWallets,
      contracts: this.workspace.pinnedContracts,
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

    return this.workspace;
  }

  async addRecentSearch(query: string): Promise<UserWorkspace> {
    if (!query.trim()) return this.workspace;
    this.workspace.recentSearches = [
      query.trim(),
      ...this.workspace.recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10);
    return this.workspace;
  }
}
