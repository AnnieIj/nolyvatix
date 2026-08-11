/**
 * Nolyvatix Data Engine - Enterprise Workspace Management Service
 * Supports named workspaces, role-based access, shareable read-only links,
 * AI conversation management, and search history.
 */

import { UserWorkspace, WorkspaceMetadata, WorkspaceRole } from '../../types/index.js';
import { Logger } from '../utils/logger.js';
import crypto from 'crypto';

const logger = new Logger('WorkspaceService');

function emptyWorkspace(): UserWorkspace {
  return {
    favoriteDashboards: [],
    recentReports: [],
    savedAIConversations: [],
    pinnedAssets: [],
    pinnedWallets: [],
    pinnedContracts: [],
    recentSearches: [],
  };
}

export class WorkspaceService {
  private workspaces: Map<string, WorkspaceMetadata> = new Map();
  private activeWorkspaceId: string;

  constructor() {
    this.activeWorkspaceId = this.seedDefaultWorkspace();
  }

  // ─────────────────────────────────────────────
  //  Seed
  // ─────────────────────────────────────────────

  private seedDefaultWorkspace(): string {
    const id = 'ws-default';
    const defaultWs: WorkspaceMetadata = {
      id,
      name: 'Stellar Mainnet Operations',
      description: 'Primary Nolyvatix workspace for mainnet analytics, dashboards, and BI reporting.',
      role: 'owner',
      isDefault: true,
      createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      updatedAt: new Date().toISOString(),
      workspace: {
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
      },
    };

    const secondWs: WorkspaceMetadata = {
      id: 'ws-testnet',
      name: 'Testnet Development',
      description: 'Isolated testnet workspace for Soroban contract development and staging.',
      role: 'owner',
      isDefault: false,
      createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      workspace: emptyWorkspace(),
    };

    this.workspaces.set(id, defaultWs);
    this.workspaces.set('ws-testnet', secondWs);
    return id;
  }

  // ─────────────────────────────────────────────
  //  Multi-Workspace CRUD
  // ─────────────────────────────────────────────

  async getAllWorkspaces(): Promise<WorkspaceMetadata[]> {
    return Array.from(this.workspaces.values()).sort((a, b) => {
      if (a.isDefault) return -1;
      if (b.isDefault) return 1;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }

  async getWorkspaceById(id: string): Promise<WorkspaceMetadata | null> {
    return this.workspaces.get(id) || null;
  }

  async getActiveWorkspace(): Promise<WorkspaceMetadata> {
    return this.workspaces.get(this.activeWorkspaceId)!;
  }

  async getWorkspace(): Promise<UserWorkspace> {
    return (await this.getActiveWorkspace()).workspace;
  }

  async switchWorkspace(id: string): Promise<WorkspaceMetadata> {
    const ws = this.workspaces.get(id);
    if (!ws) throw new Error(`Workspace ${id} not found`);
    this.activeWorkspaceId = id;
    logger.info(`Switched active workspace to: ${id} (${ws.name})`);
    return ws;
  }

  async createWorkspace(name: string, description = '', role: WorkspaceRole = 'owner'): Promise<WorkspaceMetadata> {
    const id = `ws-${Date.now()}`;
    const now = new Date().toISOString();
    const ws: WorkspaceMetadata = {
      id,
      name,
      description,
      role,
      isDefault: false,
      createdAt: now,
      updatedAt: now,
      workspace: emptyWorkspace(),
    };
    this.workspaces.set(id, ws);
    logger.info(`Created workspace: ${id} (${name})`);
    return ws;
  }

  async updateWorkspace(id: string, updates: { name?: string; description?: string }): Promise<WorkspaceMetadata> {
    const ws = this.workspaces.get(id);
    if (!ws) throw new Error(`Workspace ${id} not found`);
    if (updates.name !== undefined) ws.name = updates.name;
    if (updates.description !== undefined) ws.description = updates.description;
    ws.updatedAt = new Date().toISOString();
    this.workspaces.set(id, ws);
    logger.info(`Updated workspace metadata: ${id}`);
    return ws;
  }

  async deleteWorkspace(id: string): Promise<boolean> {
    const ws = this.workspaces.get(id);
    if (!ws) return false;
    if (ws.isDefault) throw new Error('Cannot delete the default workspace');
    if (this.activeWorkspaceId === id) {
      this.activeWorkspaceId = 'ws-default';
    }
    this.workspaces.delete(id);
    logger.info(`Deleted workspace: ${id}`);
    return true;
  }

  // ─────────────────────────────────────────────
  //  Shareable Read-Only Links
  // ─────────────────────────────────────────────

  async generateShareLink(workspaceId: string, ttlDays = 7): Promise<{ workspaceId: string; shareToken: string; shareUrl: string; expiresAt: string }> {
    const ws = this.workspaces.get(workspaceId);
    if (!ws) throw new Error(`Workspace ${workspaceId} not found`);

    const shareToken = crypto.randomBytes(16).toString('hex');
    const expiresAt = new Date(Date.now() + ttlDays * 86400000).toISOString();
    ws.shareToken = shareToken;
    ws.shareTokenExpiresAt = expiresAt;
    ws.updatedAt = new Date().toISOString();
    this.workspaces.set(workspaceId, ws);

    const shareUrl = `/workspace/share/${shareToken}`;
    logger.info(`Generated share link for workspace ${workspaceId} (expires ${expiresAt}): ${shareUrl}`);
    return { workspaceId, shareToken, shareUrl, expiresAt };
  }

  async resolveShareToken(token: string): Promise<WorkspaceMetadata | null> {
    for (const ws of this.workspaces.values()) {
      if (ws.shareToken === token) {
        if (ws.shareTokenExpiresAt && new Date() > new Date(ws.shareTokenExpiresAt)) {
          logger.warn(`Rejected expired share token for workspace: ${ws.id}`);
          return null;
        }
        return { ...ws, role: 'viewer' };
      }
    }
    return null;
  }

  // ─────────────────────────────────────────────
  //  Pinned Items
  // ─────────────────────────────────────────────

  async togglePin(category: 'dashboards' | 'assets' | 'wallets' | 'contracts', itemId: string): Promise<UserWorkspace> {
    const active = await this.getActiveWorkspace();
    const listMap = {
      dashboards: active.workspace.favoriteDashboards,
      assets: active.workspace.pinnedAssets,
      wallets: active.workspace.pinnedWallets,
      contracts: active.workspace.pinnedContracts,
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

    active.updatedAt = new Date().toISOString();
    return active.workspace;
  }

  // ─────────────────────────────────────────────
  //  Search History
  // ─────────────────────────────────────────────

  async addRecentSearch(query: string): Promise<UserWorkspace> {
    if (!query.trim()) return (await this.getActiveWorkspace()).workspace;
    const ws = await this.getActiveWorkspace();
    ws.workspace.recentSearches = [
      query.trim(),
      ...ws.workspace.recentSearches.filter((s) => s.toLowerCase() !== query.toLowerCase()),
    ].slice(0, 10);
    ws.updatedAt = new Date().toISOString();
    return ws.workspace;
  }

  async clearSearchHistory(): Promise<UserWorkspace> {
    const ws = await this.getActiveWorkspace();
    ws.workspace.recentSearches = [];
    ws.updatedAt = new Date().toISOString();
    logger.info(`Cleared search history for workspace: ${ws.id}`);
    return ws.workspace;
  }

  // ─────────────────────────────────────────────
  //  AI Conversation Management
  // ─────────────────────────────────────────────

  async saveAIConversation(title: string): Promise<UserWorkspace> {
    const ws = await this.getActiveWorkspace();
    const id = `chat-${Date.now()}`;
    ws.workspace.savedAIConversations.unshift({ id, title, timestamp: new Date().toISOString() });
    // Keep max 20 conversations
    ws.workspace.savedAIConversations = ws.workspace.savedAIConversations.slice(0, 20);
    ws.updatedAt = new Date().toISOString();
    logger.info(`Saved AI conversation: ${id} (${title})`);
    return ws.workspace;
  }

  async removeAIConversation(chatId: string): Promise<UserWorkspace> {
    const ws = await this.getActiveWorkspace();
    ws.workspace.savedAIConversations = ws.workspace.savedAIConversations.filter((c) => c.id !== chatId);
    ws.updatedAt = new Date().toISOString();
    logger.info(`Removed AI conversation: ${chatId}`);
    return ws.workspace;
  }
}
