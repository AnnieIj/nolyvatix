/**
 * Nolyvatix Data Engine - Authentication & Multi-Tenant Isolation Test Suite
 * Validates Firebase Auth middleware, JIT provisioning, and IDOR protection across services
 */

import { test, describe } from 'node:test';
import assert from 'node:assert';
import { DashboardService } from '../services/dashboardService.ts';
import { ReportService } from '../services/reportService.ts';
import { AlertService } from '../services/alertService.ts';
import { WorkspaceService } from '../services/workspaceService.ts';
import { SettingsService } from '../services/settingsService.ts';
import { NetworkService } from '../services/networkService.ts';
import { AssetService } from '../services/assetService.ts';
import { LiquidityPoolService } from '../services/liquidityPoolService.ts';
import { SorobanService } from '../services/sorobanService.ts';
import { HorizonClient } from '../clients/horizonClient.ts';
import { SorobanClient } from '../clients/sorobanClient.ts';
import { MemoryCache } from '../cache/memoryCache.ts';
import { LedgerRepository } from '../repositories/ledgerRepository.ts';
import { LedgerService } from '../services/ledgerService.ts';
import { AssetRepository } from '../repositories/assetRepository.ts';
import { LiquidityPoolRepository } from '../repositories/liquidityPoolRepository.ts';
import { SorobanRepository } from '../repositories/sorobanRepository.ts';
import { UserDbRepository } from '../repositories/db/userDbRepository.ts';
import { authenticateUser, optionalAuthenticateUser } from '../middleware/authMiddleware.ts';

describe('Firebase Authentication & Multi-Tenant Isolation', () => {
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

  describe('User Provisioning (UserDbRepository)', () => {
    test('JIT provisioning creates distinct local users for different Firebase UIDs', async () => {
      const userRepo = new UserDbRepository();
      const userA = await userRepo.getOrCreateUserFromFirebase('firebase-uid-alice', 'alice@nolyvatix.io', 'Alice');
      const userB = await userRepo.getOrCreateUserFromFirebase('firebase-uid-bob', 'bob@nolyvatix.io', 'Bob');

      assert.ok(userA.id > 0);
      assert.ok(userB.id > 0);
      assert.notStrictEqual(userA.id, userB.id, 'Users must have different IDs');
      assert.strictEqual(userA.uid, 'firebase-uid-alice');
      assert.strictEqual(userB.uid, 'firebase-uid-bob');

      // Re-fetching same user must return the identical user ID
      const userARefetch = await userRepo.getOrCreateUserFromFirebase('firebase-uid-alice');
      assert.strictEqual(userARefetch.id, userA.id);
    });
  });

  describe('Authentication Middleware', () => {
    test('authenticateUser: rejects requests with missing token when dev fallback is disabled', async () => {
      const originalEnv = process.env.ALLOW_DEV_FALLBACK;
      const originalNodeEnv = process.env.NODE_ENV;
      process.env.ALLOW_DEV_FALLBACK = 'false';
      process.env.NODE_ENV = 'production';

      const req: any = { headers: {} };
      let statusCode = 0;
      let errorResponse: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              errorResponse = payload;
            },
          };
        },
      };
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await authenticateUser(req, res, next);
      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
      const errorMsg = typeof errorResponse.error === 'string' ? errorResponse.error : errorResponse.error?.message || '';
      assert.ok(errorMsg.toLowerCase().includes('auth') || errorMsg.toLowerCase().includes('unauthorized'));

      process.env.ALLOW_DEV_FALLBACK = originalEnv;
      process.env.NODE_ENV = originalNodeEnv;
    });

    test('authenticateUser: rejects invalid/malformed bearer tokens', async () => {
      const req: any = { headers: { authorization: 'Bearer invalid.mock.token' } };
      let statusCode = 0;
      let errorResponse: any = null;
      const res: any = {
        status: (code: number) => {
          statusCode = code;
          return {
            json: (payload: any) => {
              errorResponse = payload;
            },
          };
        },
      };
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await authenticateUser(req, res, next);
      assert.strictEqual(statusCode, 401);
      assert.strictEqual(nextCalled, false);
      const errorMsg = typeof errorResponse.error === 'string' ? errorResponse.error : errorResponse.error?.message || '';
      assert.ok(errorMsg.toLowerCase().includes('token') || errorMsg.toLowerCase().includes('invalid'));
    });

    test('optionalAuthenticateUser: does not block request if no auth header present', async () => {
      const req: any = { headers: {} };
      const res: any = {};
      let nextCalled = false;
      const next = () => {
        nextCalled = true;
      };

      await optionalAuthenticateUser(req, res, next);
      assert.strictEqual(nextCalled, true);
      assert.strictEqual(req.user, undefined);
    });
  });

  describe('Multi-Tenant Isolation & IDOR Protection', () => {
    test('DashboardService: enforces tenant isolation between User 1 and User 2', async () => {
      const userRepo = new UserDbRepository();
      const user1 = await userRepo.getOrCreateUserFromFirebase('firebase-dash-user-1', 'dash1@nolyvatix.io');
      const user2 = await userRepo.getOrCreateUserFromFirebase('firebase-dash-user-2', 'dash2@nolyvatix.io');
      const user1Id = user1.id;
      const user2Id = user2.id;

      const dashboardService = new DashboardService();

      // User 1 creates a private dashboard
      const dash1 = await dashboardService.createDashboard(
        { title: 'User 1 Confidential Strategy', description: 'Internal DeFi analytics' },
        user1Id
      );
      assert.ok(dash1.id);

      // User 1 can view it
      const user1Dashboards = await dashboardService.getAllDashboards(user1Id);
      assert.ok(user1Dashboards.some((d) => d.id === dash1.id));

      const fetchedByUser1 = await dashboardService.getDashboardById(dash1.id, user1Id);
      assert.ok(fetchedByUser1 !== null);
      assert.strictEqual(fetchedByUser1?.title, 'User 1 Confidential Strategy');

      // User 2 CANNOT view User 1's private dashboard in list
      const user2Dashboards = await dashboardService.getAllDashboards(user2Id);
      assert.ok(!user2Dashboards.some((d) => d.id === dash1.id), 'User 2 must not see User 1 private dashboard');

      // User 2 CANNOT fetch User 1's dashboard by ID
      const fetchedByUser2 = await dashboardService.getDashboardById(dash1.id, user2Id);
      assert.strictEqual(fetchedByUser2, null, 'Direct access by User 2 must return null');

      // User 2 CANNOT update User 1's dashboard
      await assert.rejects(
        async () => {
          await dashboardService.updateDashboard(dash1.id, { title: 'Hacked by User 2' }, user2Id);
        },
        /not found|unauthorized/i
      );

      // User 2 CANNOT delete User 1's dashboard
      const deleteResult = await dashboardService.deleteDashboard(dash1.id, user2Id);
      assert.strictEqual(deleteResult, false);

      // User 1 CAN delete their own dashboard
      const ownerDeleteResult = await dashboardService.deleteDashboard(dash1.id, user1Id);
      assert.strictEqual(ownerDeleteResult, true);
    });

    test('ReportService: enforces tenant isolation on report access and exports', async () => {
      const userRepo = new UserDbRepository();
      const user1 = await userRepo.getOrCreateUserFromFirebase('firebase-rep-user-1', 'rep1@nolyvatix.io');
      const user2 = await userRepo.getOrCreateUserFromFirebase('firebase-rep-user-2', 'rep2@nolyvatix.io');
      const user1Id = user1.id;
      const user2Id = user2.id;

      const reportService = new ReportService(networkService, assetService, poolService, sorobanService);

      const report1 = await reportService.generateReport({ period: 'daily' }, user1Id);
      assert.ok(report1.id);

      // User 1 can export
      const user1Export = await reportService.exportReport(report1.id, 'json', user1Id);
      assert.strictEqual(user1Export.contentType, 'application/json');

      // User 2 cannot export User 1 report
      await assert.rejects(
        async () => {
          await reportService.exportReport(report1.id, 'json', user2Id);
        },
        /not found|unauthorized/i
      );

      // User 2 cannot delete User 1 report
      const deleteResult = await reportService.deleteReport(report1.id, user2Id);
      assert.strictEqual(deleteResult, false);
    });

    test('AlertService: enforces tenant isolation on alerts and trigger dispatch', async () => {
      const userRepo = new UserDbRepository();
      const user1 = await userRepo.getOrCreateUserFromFirebase('firebase-alert-user-1', 'alt1@nolyvatix.io');
      const user2 = await userRepo.getOrCreateUserFromFirebase('firebase-alert-user-2', 'alt2@nolyvatix.io');
      const user1Id = user1.id;
      const user2Id = user2.id;

      const alertService = new AlertService();

      const alert1 = await alertService.createAlert(
        {
          name: 'User 1 Confidential Whale Alert',
          target: 'whale_movement',
          condition: 'above',
          threshold: 500000,
          channel: 'browser',
        },
        user1Id
      );

      // User 1 can view
      const user1Alert = await alertService.getAlertById(alert1.id, user1Id);
      assert.ok(user1Alert !== null);
      assert.strictEqual(user1Alert?.name, 'User 1 Confidential Whale Alert');

      // User 2 cannot view
      const user2Alert = await alertService.getAlertById(alert1.id, user2Id);
      assert.strictEqual(user2Alert, null);

      // User 2 cannot test-trigger User 1 alert
      await assert.rejects(
        async () => {
          await alertService.testTriggerAlert(alert1.id, user2Id);
        },
        /not found|unauthorized/i
      );

      // User 2 cannot delete User 1 alert
      const deleteAttempt = await alertService.deleteAlert(alert1.id, user2Id);
      assert.strictEqual(deleteAttempt, false);
    });

    test('WorkspaceService: keeps pinned items and searches strictly isolated per tenant', async () => {
      const userRepo = new UserDbRepository();
      const user1 = await userRepo.getOrCreateUserFromFirebase('firebase-ws-user-1', 'ws1@nolyvatix.io');
      const user2 = await userRepo.getOrCreateUserFromFirebase('firebase-ws-user-2', 'ws2@nolyvatix.io');
      const user1Id = user1.id;
      const user2Id = user2.id;

      const wsService = new WorkspaceService();

      await wsService.togglePin('assets', 'USDC:GA5ZSEJYB37JRC5AVCI5M4GE323XNNOACS4M4S3Y3XAC', user1Id);
      await wsService.addRecentSearch('User 1 Secret Query', user1Id);

      const wsUser1 = await wsService.getWorkspace(user1Id);
      const wsUser2 = await wsService.getWorkspace(user2Id);

      assert.ok(wsUser1.recentSearches.includes('User 1 Secret Query'));
      assert.ok(!wsUser2.recentSearches.includes('User 1 Secret Query'), "User 2 must not see User 1's search history");
    });

    test('SettingsService: isolates platform preferences per tenant', async () => {
      const userRepo = new UserDbRepository();
      const user1 = await userRepo.getOrCreateUserFromFirebase('firebase-set-user-1', 'set1@nolyvatix.io');
      const user2 = await userRepo.getOrCreateUserFromFirebase('firebase-set-user-2', 'set2@nolyvatix.io');
      const user1Id = user1.id;
      const user2Id = user2.id;

      const settingsService = new SettingsService();

      await settingsService.updateSettings({ theme: 'light', refreshIntervalSeconds: 30 }, user1Id);

      const user1Settings = await settingsService.getSettings(user1Id);
      const user2Settings = await settingsService.getSettings(user2Id);

      assert.strictEqual(user1Settings.theme, 'light');
      assert.strictEqual(user1Settings.refreshIntervalSeconds, 30);
      assert.strictEqual(user2Settings.theme, 'dark'); // Default
      assert.strictEqual(user2Settings.refreshIntervalSeconds, 10); // Default
    });
  });
});
