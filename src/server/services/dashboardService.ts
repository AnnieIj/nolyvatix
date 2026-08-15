/**
 * Nolyvatix Data Engine - Custom Dashboard Service
 * Manages custom drag-and-drop dashboards, widgets, pinning, and layouts
 * Backed by Cloud SQL PostgreSQL with seamless in-memory fallback
 */

import { CustomDashboard } from '../../types/index.ts';
import { Logger } from '../utils/logger.ts';
import { DashboardDbRepository } from '../repositories/db/dashboardDbRepository.ts';
import { UserDbRepository } from '../repositories/db/userDbRepository.ts';

const logger = new Logger('DashboardService');

export class DashboardService {
  private inMemoryDashboards: Map<string, CustomDashboard> = new Map();

  constructor(
    private dashboardRepo: DashboardDbRepository = new DashboardDbRepository(),
    private userRepo: UserDbRepository = new UserDbRepository()
  ) {
    this.seedDefaultDashboards();
  }

  private seedDefaultDashboards() {
    const defaultDashboards: CustomDashboard[] = [
      {
        id: 'dash-mainnet-overview',
        title: 'Stellar Mainnet Executive Command',
        description: 'Real-time ledger sequence, settlement throughput TPS, cross-border volume and network status.',
        isPinned: true,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: [
          {
            id: 'w-net-status',
            title: 'Network Live Pulse',
            type: 'network_status',
            widgetType: 'network_status',
            gridSpan: 4,
          },
          {
            id: 'w-tps-trend',
            title: 'Throughput TPS (24h)',
            type: 'line_chart',
            widgetType: 'line_chart',
            gridSpan: 8,
          },
          {
            id: 'w-kpi-vol',
            title: 'Settlement Volume USD',
            type: 'kpi_card',
            widgetType: 'kpi_card',
            gridSpan: 3,
            metricKey: 'volume24h',
          },
          {
            id: 'w-kpi-acc',
            title: 'Active Wallets 24h',
            type: 'kpi_card',
            widgetType: 'kpi_card',
            gridSpan: 3,
            metricKey: 'activeWallets',
          },
          {
            id: 'w-kpi-close',
            title: 'Avg Close Time',
            type: 'kpi_card',
            widgetType: 'kpi_card',
            gridSpan: 3,
            metricKey: 'closeTime',
          },
          {
            id: 'w-kpi-gas',
            title: 'Soroban WASM CPU Gas',
            type: 'kpi_card',
            widgetType: 'kpi_card',
            gridSpan: 3,
            metricKey: 'sorobanGas',
          },
          {
            id: 'w-ai-digest',
            title: 'Gemini Executive Summary',
            type: 'ai_summary',
            widgetType: 'ai_summary',
            gridSpan: 12,
          },
        ],
      },
      {
        id: 'dash-soroban-apm',
        title: 'Soroban WASM APM & Smart Contract Health',
        description: 'Contract execution velocity, WASM CPU gas monitoring, memory footprint, and failure rates.',
        isPinned: false,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: [
          {
            id: 'w-soroban-main',
            title: 'Top Soroban Contracts APM',
            type: 'soroban_apm',
            widgetType: 'soroban_apm',
            gridSpan: 6,
          },
          {
            id: 'w-soroban-gas-bar',
            title: 'WASM CPU Gas Unit Consumption',
            type: 'bar_chart',
            widgetType: 'bar_chart',
            gridSpan: 6,
          },
          {
            id: 'w-soroban-events-table',
            title: 'Recent Contract Invocations & Events',
            type: 'table',
            widgetType: 'table',
            gridSpan: 12,
          },
        ],
      },
      {
        id: 'dash-liquidity-dex',
        title: 'DEX AMM Pools & Anchor Corridors',
        description: 'Circle USDC / EURC corridor settlement volume, liquidity pool TVL share, and payment throughput.',
        isPinned: true,
        isPublic: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        widgets: [
          {
            id: 'w-asset-analytics',
            title: 'Anchor Asset Growth & Trustlines',
            type: 'asset_analytics',
            widgetType: 'asset_analytics',
            gridSpan: 6,
          },
          {
            id: 'w-liquidity-pools',
            title: 'AMM Liquidity Pool TVL Share',
            type: 'donut_chart',
            widgetType: 'donut_chart',
            gridSpan: 6,
          },
          {
            id: 'w-dex-analytics',
            title: 'DEX Order Book & Spread Analytics',
            type: 'dex_analytics',
            widgetType: 'dex_analytics',
            gridSpan: 12,
          },
        ],
      },
    ];

    defaultDashboards.forEach((d) => this.inMemoryDashboards.set(d.id, d));
    logger.info(`Seeded ${defaultDashboards.length} initial default dashboards.`);
  }

  async getAllDashboards(): Promise<CustomDashboard[]> {
    try {
      const user = await this.userRepo.getOrCreateDefaultUser();
      const dbDashboards = await this.dashboardRepo.getAllDashboards(user.id);
      if (dbDashboards && dbDashboards.length > 0) {
        return dbDashboards;
      }
    } catch (e) {
      logger.error('Error querying dashboards from DB, falling back to memory', e);
    }
    return Array.from(this.inMemoryDashboards.values()).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }

  async getDashboardById(id: string): Promise<CustomDashboard | null> {
    try {
      const fromDb = await this.dashboardRepo.getDashboardById(id);
      if (fromDb) return fromDb;
    } catch (e) {
      logger.error(`Error querying dashboard ${id} from DB, checking memory`, e);
    }
    return this.inMemoryDashboards.get(id) || null;
  }

  async createDashboard(data: Partial<CustomDashboard>): Promise<CustomDashboard> {
    try {
      const user = await this.userRepo.getOrCreateDefaultUser();
      const created = await this.dashboardRepo.createDashboard(user.id, data);
      if (created) {
        this.inMemoryDashboards.set(created.id, created);
        return created;
      }
    } catch (e) {
      logger.error('Failed to create dashboard in DB, creating in memory', e);
    }

    const id = `dash-${Date.now()}`;
    const newDashboard: CustomDashboard = {
      id,
      title: data.title || 'Untitled BI Dashboard',
      description: data.description || 'Custom user-built analytics view',
      isPinned: !!data.isPinned,
      isPublic: data.isPublic ?? true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      widgets: data.widgets || [
        {
          id: `w-${Date.now()}-1`,
          title: 'Network Throughput',
          type: 'line_chart',
          widgetType: 'line_chart',
          gridSpan: 6,
        },
        {
          id: `w-${Date.now()}-2`,
          title: 'Key Metrics',
          type: 'kpi_card',
          widgetType: 'kpi_card',
          gridSpan: 6,
        },
      ],
    };

    this.inMemoryDashboards.set(id, newDashboard);
    logger.info(`Created new dashboard: ${newDashboard.id} (${newDashboard.title})`);
    return newDashboard;
  }

  async updateDashboard(id: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> {
    try {
      const updatedInDb = await this.dashboardRepo.updateDashboard(id, updates);
      if (updatedInDb) {
        this.inMemoryDashboards.set(id, updatedInDb);
        return updatedInDb;
      }
    } catch (e) {
      logger.error(`Failed to update dashboard ${id} in DB`, e);
    }

    const existing = this.inMemoryDashboards.get(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    const updated: CustomDashboard = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.inMemoryDashboards.set(id, updated);
    logger.info(`Updated dashboard in memory: ${id}`);
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    try {
      await this.dashboardRepo.deleteDashboard(id);
    } catch (e) {
      logger.error(`Failed to delete dashboard ${id} from DB`, e);
    }
    const deleted = this.inMemoryDashboards.delete(id);
    if (deleted) {
      logger.info(`Deleted dashboard: ${id}`);
    }
    return deleted;
  }

  async duplicateDashboard(id: string): Promise<CustomDashboard> {
    const existing = await this.getDashboardById(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    return this.createDashboard({
      title: `${existing.title} (Copy)`,
      description: existing.description,
      isPinned: existing.isPinned,
      isPublic: existing.isPublic,
      widgets: existing.widgets.map((w, idx) => ({ ...w, id: `w-dup-${Date.now()}-${idx}` })),
    });
  }

  async togglePinDashboard(id: string): Promise<CustomDashboard> {
    const existing = await this.getDashboardById(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    return this.updateDashboard(id, { isPinned: !existing.isPinned });
  }
}
