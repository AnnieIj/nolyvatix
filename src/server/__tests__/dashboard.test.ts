import { describe, it } from 'node:test';
import assert from 'node:assert';
import { DashboardService } from '../services/dashboardService.js';

describe('DashboardService', () => {
  it('should seed default dashboards on initialization', async () => {
    const service = new DashboardService();
    const dashboards = await service.getAllDashboards();
    assert.ok(dashboards.length >= 3, 'Should seed at least 3 default dashboards');
    assert.strictEqual(dashboards[0].isPinned, true);
  });

  it('should create new dashboard cleanly', async () => {
    const service = new DashboardService();
    const created = await service.createDashboard({
      title: 'Soroban WASM Performance Tracker',
      description: 'Test dashboard for smart contracts',
    });
    assert.ok(created.id.startsWith('dash-'));
    assert.strictEqual(created.title, 'Soroban WASM Performance Tracker');

    const fetched = await service.getDashboardById(created.id);
    assert.strictEqual(fetched?.id, created.id);
  });

  it('should update dashboard layout and title', async () => {
    const service = new DashboardService();
    const created = await service.createDashboard({ title: 'Original Title' });
    const updated = await service.updateDashboard(created.id, {
      title: 'Updated Title',
    });
    assert.strictEqual(updated.title, 'Updated Title');
  });

  it('should toggle pin state and duplicate dashboard', async () => {
    const service = new DashboardService();
    const dashboards = await service.getAllDashboards();
    const targetId = dashboards[0].id;

    const pinned = await service.togglePinDashboard(targetId);
    assert.strictEqual(typeof pinned.isPinned, 'boolean');

    const duplicated = await service.duplicateDashboard(targetId);
    assert.ok(duplicated.id.includes('copy'));
    assert.strictEqual(duplicated.title.includes('(Copy)'), true);
  });
});
