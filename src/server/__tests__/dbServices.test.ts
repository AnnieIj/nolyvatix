/**
 * Nolyvatix Data Engine - Cloud SQL & Persistent Service Layer Unit Tests
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DashboardService } from '../services/dashboardService.js';
import { ReportService } from '../services/reportService.js';
import { AlertService } from '../services/alertService.js';
import { WorkspaceService } from '../services/workspaceService.js';
import { NetworkService } from '../services/networkService.js';
import { AssetService } from '../services/assetService.js';
import { LiquidityPoolService } from '../services/liquidityPoolService.js';
import { SorobanService } from '../services/sorobanService.js';
import { HorizonClient } from '../clients/horizonClient.js';
import { SorobanClient } from '../clients/sorobanClient.js';
import { MemoryCache } from '../cache/memoryCache.js';
import { LedgerRepository } from '../repositories/ledgerRepository.js';
import { LedgerService } from '../services/ledgerService.js';
import { AssetRepository } from '../repositories/assetRepository.js';
import { LiquidityPoolRepository } from '../repositories/liquidityPoolRepository.js';
import { SorobanRepository } from '../repositories/sorobanRepository.js';

describe('Persistent Services Layer (with Cloud SQL Repositories)', () => {
  const horizonClient = new HorizonClient({ network: 'mainnet' });
  const sorobanClient = new SorobanClient({ network: 'mainnet' });
  const cache = new MemoryCache();

  const ledgerRepo = new LedgerRepository(horizonClient, cache);
  const ledgerService = new LedgerService(ledgerRepo);
  const networkService = new NetworkService(horizonClient, sorobanClient, ledgerService);
  const assetRepo = new AssetRepository(horizonClient, cache);
  const assetService = new AssetService(assetRepo);
  const poolRepo = new LiquidityPoolRepository(horizonClient, cache);
  const poolService = new LiquidityPoolService(poolRepo);
  const sorobanRepo = new SorobanRepository(sorobanClient, cache);
  const sorobanService = new SorobanService(sorobanRepo, sorobanClient);

  test('DashboardService: should fetch, create, update and delete dashboards', async () => {
    const dashboardService = new DashboardService();
    const initialDashboards = await dashboardService.getAllDashboards();
    assert.ok(initialDashboards.length >= 3, 'Should have initial seeded dashboards');

    const created = await dashboardService.createDashboard({
      title: 'DeFi Liquidity Hub',
      description: 'AMM pool analytics',
      isPinned: true,
    });
    assert.strictEqual(created.title, 'DeFi Liquidity Hub');
    assert.strictEqual(created.isPinned, true);

    const fetched = await dashboardService.getDashboardById(created.id);
    assert.ok(fetched !== null);
    assert.strictEqual(fetched?.title, 'DeFi Liquidity Hub');

    const updated = await dashboardService.updateDashboard(created.id, { title: 'Updated DeFi Hub' });
    assert.strictEqual(updated.title, 'Updated DeFi Hub');

    const deleted = await dashboardService.deleteDashboard(created.id);
    assert.strictEqual(deleted, true);
  });

  test('ReportService: should list, generate, and export analytical reports', async () => {
    const reportService = new ReportService(networkService, assetService, poolService, sorobanService);
    const reports = await reportService.getAllReports();
    assert.ok(reports.length >= 1, 'Should have initial seeded reports');

    const generated = await reportService.generateReport({ period: 'daily' });
    assert.ok(Boolean(generated.id));
    assert.strictEqual(generated.period, 'daily');
    assert.ok(generated.content.executiveSummaryText.length > 0);

    const exportedCsv = await reportService.exportReport(generated.id, 'csv');
    assert.strictEqual(exportedCsv.contentType, 'text/csv');
    assert.ok(exportedCsv.data.includes('Category,Metric,Value'));
  });

  test('AlertService: should manage alert rules and trigger test dispatch', async () => {
    const alertService = new AlertService();
    const alerts = await alertService.getAllAlerts();
    assert.ok(alerts.length >= 1, 'Should have alerts');

    const newAlert = await alertService.createAlert({
      name: 'Custom Protocol Anomaly',
      target: 'tps_drops',
      condition: 'below',
      threshold: 10,
      channel: 'browser',
    });
    assert.strictEqual(newAlert.name, 'Custom Protocol Anomaly');

    const triggered = await alertService.testTriggerAlert(newAlert.id);
    assert.strictEqual(triggered.success, true);
    assert.ok(triggered.payload.alertId === newAlert.id);
  });

  test('WorkspaceService: should manage favorites and search history', async () => {
    const wsService = new WorkspaceService();
    const ws = await wsService.getWorkspace();
    assert.ok(ws.favoriteDashboards.length > 0);

    const updatedWs = await wsService.togglePin('dashboards', 'test-dashboard-id');
    assert.ok(updatedWs.favoriteDashboards.includes('test-dashboard-id'));

    const searchWs = await wsService.addRecentSearch('XLM liquidity');
    assert.ok(searchWs.recentSearches.includes('XLM liquidity'));
  });
});
