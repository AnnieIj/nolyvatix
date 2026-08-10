import { describe, it } from 'node:test';
import assert from 'node:assert';
import { ReportService } from '../services/reportService.js';
import { NetworkService } from '../services/networkService.js';
import { AssetService } from '../services/assetService.js';
import { LiquidityPoolService } from '../services/liquidityPoolService.js';
import { SorobanService } from '../services/sorobanService.js';
import { LedgerService } from '../services/ledgerService.js';
import { LedgerRepository } from '../repositories/ledgerRepository.js';
import { AssetRepository } from '../repositories/assetRepository.js';
import { LiquidityPoolRepository } from '../repositories/liquidityPoolRepository.js';
import { SorobanRepository } from '../repositories/sorobanRepository.js';
import { globalCache } from '../cache/memoryCache.js';
import { defaultHorizonClient } from '../clients/horizonClient.js';
import { defaultSorobanClient } from '../clients/sorobanClient.js';

describe('ReportService', () => {
  const cache = globalCache;
  const ledgerRepo = new LedgerRepository(defaultHorizonClient, cache);
  const assetRepo = new AssetRepository(defaultHorizonClient, cache);
  const poolRepo = new LiquidityPoolRepository(defaultHorizonClient, cache);
  const sorobanRepo = new SorobanRepository(defaultSorobanClient, cache);

  const ledgerService = new LedgerService(ledgerRepo);
  const assetService = new AssetService(assetRepo);
  const poolService = new LiquidityPoolService(poolRepo);
  const sorobanService = new SorobanService(sorobanRepo, defaultSorobanClient);
  const networkService = new NetworkService(defaultHorizonClient, defaultSorobanClient, ledgerService);

  it('should seed default executive digest report on construction', async () => {
    const reportService = new ReportService(networkService, assetService, poolService, sorobanService);
    const reports = await reportService.getAllReports();
    assert.ok(reports.length >= 1);
    assert.strictEqual(reports[0].period, 'daily');
    assert.ok(reports[0].content.networkHealth.tps > 0);
  });

  it('should generate a new weekly report', async () => {
    const reportService = new ReportService(networkService, assetService, poolService, sorobanService);
    const created = await reportService.generateReport({
      period: 'weekly',
      sections: ['Executive Summary', 'Network Health'],
    });
    assert.ok(created.id.startsWith('rep-'));
    assert.strictEqual(created.period, 'weekly');
    assert.ok(created.content.kpis.length > 0);
  });

  it('should export report in JSON, CSV, and Markdown formats', async () => {
    const reportService = new ReportService(networkService, assetService, poolService, sorobanService);
    const reports = await reportService.getAllReports();
    const reportId = reports[0].id;

    const jsonExport = await reportService.exportReport(reportId, 'json');
    assert.strictEqual(jsonExport.contentType, 'application/json');
    assert.ok(jsonExport.data.includes('executiveSummaryText'));

    const csvExport = await reportService.exportReport(reportId, 'csv');
    assert.strictEqual(csvExport.contentType, 'text/csv');
    assert.ok(csvExport.data.includes('Category,Metric,Value'));

    const mdExport = await reportService.exportReport(reportId, 'markdown');
    assert.strictEqual(mdExport.contentType, 'text/markdown');
    assert.ok(mdExport.data.includes('# Stellar Mainnet'));
  });
});
