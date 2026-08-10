/**
 * Nolyvatix Data Engine - Custom Dashboard Service
 * Manages custom drag-and-drop dashboards, widgets, pinning, and layouts
 */

import { CustomDashboard, WidgetConfig, WidgetType } from '../../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('DashboardService');

export class DashboardService {
  private dashboards: Map<string, CustomDashboard> = new Map();

  constructor() {
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

    defaultDashboards.forEach((d) => this.dashboards.set(d.id, d));
    logger.info(`Seeded ${defaultDashboards.length} initial default dashboards.`);
  }

  async getAllDashboards(): Promise<CustomDashboard[]> {
    return Array.from(this.dashboards.values()).sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0));
  }

  async getDashboardById(id: string): Promise<CustomDashboard | null> {
    return this.dashboards.get(id) || null;
  }

  async createDashboard(data: Partial<CustomDashboard>): Promise<CustomDashboard> {
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

    this.dashboards.set(id, newDashboard);
    logger.info(`Created new dashboard: ${newDashboard.id} (${newDashboard.title})`);
    return newDashboard;
  }

  async updateDashboard(id: string, updates: Partial<CustomDashboard>): Promise<CustomDashboard> {
    const existing = this.dashboards.get(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    const updated: CustomDashboard = {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    this.dashboards.set(id, updated);
    logger.info(`Updated dashboard: ${id}`);
    return updated;
  }

  async deleteDashboard(id: string): Promise<boolean> {
    const deleted = this.dashboards.delete(id);
    if (deleted) {
      logger.info(`Deleted dashboard: ${id}`);
    }
    return deleted;
  }

  async duplicateDashboard(id: string): Promise<CustomDashboard> {
    const existing = this.dashboards.get(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    const duplicated: CustomDashboard = {
      ...existing,
      id: `dash-copy-${Date.now()}`,
      title: `${existing.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      widgets: existing.widgets.map((w, idx) => ({ ...w, id: `w-dup-${Date.now()}-${idx}` })),
    };

    this.dashboards.set(duplicated.id, duplicated);
    logger.info(`Duplicated dashboard ${id} -> ${duplicated.id}`);
    return duplicated;
  }

  async togglePinDashboard(id: string): Promise<CustomDashboard> {
    const existing = this.dashboards.get(id);
    if (!existing) {
      throw new Error(`Dashboard ${id} not found`);
    }

    existing.isPinned = !existing.isPinned;
    existing.updatedAt = new Date().toISOString();
    this.dashboards.set(id, existing);
    logger.info(`Toggled pin state for dashboard ${id}: ${existing.isPinned}`);
    return existing;
  }
}
