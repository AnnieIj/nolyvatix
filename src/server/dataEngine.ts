/**
 * Nolyvatix Stellar Data Engine - Main DI Container & Application Initializer
 * Wires Repositories, Services, Event Bus, SSE Streamer, and Express Routers.
 */

import { Router } from 'express';
import { defaultHorizonClient, HorizonClient } from './clients/horizonClient.js';
import { defaultSorobanClient, SorobanClient } from './clients/sorobanClient.js';
import { globalCache, MemoryCache } from './cache/memoryCache.js';
import { globalStellarCache, StellarCache } from './cache/stellarCache.js';

// Stellar Live Service Layer
import {
  StellarHorizonClient,
  StellarSorobanClient,
  StellarAssetService,
  StellarWalletService,
  StellarLiquidityService,
  StellarAnalyticsService,
  StellarEventBus,
} from './services/stellar/index.js';

import { LedgerRepository } from './repositories/ledgerRepository.js';
import { TransactionRepository } from './repositories/transactionRepository.js';
import { OperationRepository } from './repositories/operationRepository.js';
import { AccountRepository } from './repositories/accountRepository.js';
import { AssetRepository } from './repositories/assetRepository.js';
import { LiquidityPoolRepository } from './repositories/liquidityPoolRepository.js';
import { SorobanRepository } from './repositories/sorobanRepository.js';

import { LedgerService } from './services/ledgerService.js';
import { TransactionService } from './services/transactionService.js';
import { OperationService } from './services/operationService.js';
import { AccountService } from './services/accountService.js';
import { AssetService } from './services/assetService.js';
import { LiquidityPoolService } from './services/liquidityPoolService.js';
import { SorobanService } from './services/sorobanService.js';
import { NetworkService } from './services/networkService.js';
import { AiService } from './services/aiService.js';
import { DashboardService } from './services/dashboardService.js';
import { ReportService } from './services/reportService.js';
import { AlertService } from './services/alertService.js';
import { WorkspaceService } from './services/workspaceService.js';
import { SearchService } from './services/searchService.js';
import { SettingsService } from './services/settingsService.js';

import { createNetworkRouter } from './routes/networkRoutes.js';
import { createLedgerRouter } from './routes/ledgerRoutes.js';
import { createTransactionRouter } from './routes/transactionRoutes.js';
import { createAccountRouter } from './routes/accountRoutes.js';
import { createAssetRouter } from './routes/assetRoutes.js';
import { createLiquidityPoolRouter } from './routes/liquidityPoolRoutes.js';
import { createOperationRouter } from './routes/operationRoutes.js';
import { createSorobanRouter } from './routes/sorobanRoutes.js';
import { createAiRouter } from './routes/aiRoutes.js';
import { createDashboardRouter } from './routes/dashboardRoutes.js';
import { createReportRouter } from './routes/reportRoutes.js';
import { createAlertRouter } from './routes/alertRoutes.js';
import { createWorkspaceRouter } from './routes/workspaceRoutes.js';
import { createSearchRouter } from './routes/searchRoutes.js';
import { createSettingsRouter } from './routes/settingsRoutes.js';
import { createStreamRouter } from './routes/streamRoutes.js';
import { createHealthRouter } from './routes/healthRoutes.js';
import { Logger } from './utils/logger.js';

const logger = new Logger('DataEngine');

export interface DataEngineInstance {
  horizonClient: HorizonClient;
  sorobanClient: SorobanClient;
  cache: MemoryCache;
  stellarCache: StellarCache;
  eventBus: StellarEventBus;
  repositories: {
    ledger: LedgerRepository;
    transaction: TransactionRepository;
    operation: OperationRepository;
    account: AccountRepository;
    asset: AssetRepository;
    liquidityPool: LiquidityPoolRepository;
    soroban: SorobanRepository;
  };
  services: {
    ledger: LedgerService;
    transaction: TransactionService;
    operation: OperationService;
    account: AccountService;
    asset: AssetService;
    liquidityPool: LiquidityPoolService;
    soroban: SorobanService;
    network: NetworkService;
    ai: AiService;
    dashboard: DashboardService;
    report: ReportService;
    alert: AlertService;
    workspace: WorkspaceService;
    search: SearchService;
    settings: SettingsService;
    stellarAsset: StellarAssetService;
    stellarWallet: StellarWalletService;
    stellarLiquidity: StellarLiquidityService;
    stellarAnalytics: StellarAnalyticsService;
  };
  apiRouter: Router;
}

export function initializeDataEngine(
  customHorizonClient?: HorizonClient,
  customSorobanClient?: SorobanClient,
  customCache?: MemoryCache
): DataEngineInstance {
  logger.info('Initializing Nolyvatix Stellar Production Data Engine...');

  const horizonClient = customHorizonClient || defaultHorizonClient;
  const sorobanClient = customSorobanClient || defaultSorobanClient;
  const cache = customCache || globalCache;
  const stellarCache = globalStellarCache;

  // Initialize Stellar Live Service Layer components
  const stellarHorizonClient = new StellarHorizonClient({
    network: horizonClient.getNetwork(),
  });
  const stellarSorobanClient = new StellarSorobanClient({
    network: sorobanClient.getNetwork(),
  });

  const stellarAssetService = new StellarAssetService(stellarHorizonClient, stellarCache);
  const stellarWalletService = new StellarWalletService(stellarHorizonClient, stellarCache);
  const stellarLiquidityService = new StellarLiquidityService(stellarHorizonClient, stellarCache);
  const stellarAnalyticsService = new StellarAnalyticsService(
    stellarHorizonClient,
    stellarSorobanClient,
    stellarCache
  );

  // Initialize Real-time Event Bus & SSE Manager
  const eventBus = new StellarEventBus(
    stellarAnalyticsService,
    stellarAssetService,
    stellarLiquidityService,
    stellarHorizonClient,
    stellarSorobanClient,
    stellarCache
  );

  // Initialize Classic Repositories
  const ledgerRepo = new LedgerRepository(horizonClient, cache);
  const txRepo = new TransactionRepository(horizonClient, cache);
  const opRepo = new OperationRepository(horizonClient, cache);
  const accountRepo = new AccountRepository(horizonClient, cache);
  const assetRepo = new AssetRepository(horizonClient, cache);
  const poolRepo = new LiquidityPoolRepository(horizonClient, cache);
  const sorobanRepo = new SorobanRepository(sorobanClient, cache);

  // Initialize Domain Services
  const ledgerService = new LedgerService(ledgerRepo);
  const txService = new TransactionService(txRepo);
  const opService = new OperationService(opRepo);
  const accountService = new AccountService(accountRepo, txRepo, opRepo);
  const assetService = new AssetService(assetRepo);
  const poolService = new LiquidityPoolService(poolRepo);
  const sorobanService = new SorobanService(sorobanRepo, sorobanClient);
  const networkService = new NetworkService(horizonClient, sorobanClient, ledgerService);
  const aiService = new AiService(
    networkService,
    ledgerService,
    txService,
    accountService,
    assetService,
    poolService,
    sorobanService,
    opService
  );

  const dashboardService = new DashboardService();
  const reportService = new ReportService(networkService, assetService, poolService, sorobanService);
  const alertService = new AlertService();
  const workspaceService = new WorkspaceService();
  const searchService = new SearchService(assetService, poolService, sorobanService, dashboardService, reportService);
  const settingsService = new SettingsService();

  // Initialize Main API Router
  const apiRouter = Router();

  // System Health & Diagnostics
  apiRouter.use('/health', createHealthRouter(stellarHorizonClient, stellarSorobanClient, stellarCache, eventBus));

  // Real-Time Server-Sent Events (SSE)
  apiRouter.use('/stream', createStreamRouter(eventBus));

  // Domain Routes
  apiRouter.use('/network', createNetworkRouter(networkService));
  apiRouter.use('/ledgers', createLedgerRouter(ledgerService, txService, opService));
  apiRouter.use('/transactions', createTransactionRouter(txService, opService));
  apiRouter.use('/accounts', createAccountRouter(accountService));
  apiRouter.use('/assets', createAssetRouter(assetService));
  apiRouter.use('/liquidity-pools', createLiquidityPoolRouter(poolService));
  apiRouter.use('/operations', createOperationRouter(opService));
  apiRouter.use('/soroban', createSorobanRouter(sorobanService));
  apiRouter.use('/ai', createAiRouter(aiService));
  apiRouter.use('/dashboards', createDashboardRouter(dashboardService));
  apiRouter.use('/reports', createReportRouter(reportService));
  apiRouter.use('/alerts', createAlertRouter(alertService));
  apiRouter.use('/workspaces', createWorkspaceRouter(workspaceService));
  apiRouter.use('/search', createSearchRouter(searchService));
  apiRouter.use('/settings', createSettingsRouter(settingsService));

  logger.info('Stellar Production Data Engine successfully initialized with Event Bus, SSE, and all routes.');

  return {
    horizonClient,
    sorobanClient,
    cache,
    stellarCache,
    eventBus,
    repositories: {
      ledger: ledgerRepo,
      transaction: txRepo,
      operation: opRepo,
      account: accountRepo,
      asset: assetRepo,
      liquidityPool: poolRepo,
      soroban: sorobanRepo,
    },
    services: {
      ledger: ledgerService,
      transaction: txService,
      operation: opService,
      account: accountService,
      asset: assetService,
      liquidityPool: poolService,
      soroban: sorobanService,
      network: networkService,
      ai: aiService,
      dashboard: dashboardService,
      report: reportService,
      alert: alertService,
      workspace: workspaceService,
      search: searchService,
      settings: settingsService,
      stellarAsset: stellarAssetService,
      stellarWallet: stellarWalletService,
      stellarLiquidity: stellarLiquidityService,
      stellarAnalytics: stellarAnalyticsService,
    },
    apiRouter,
  };
}
