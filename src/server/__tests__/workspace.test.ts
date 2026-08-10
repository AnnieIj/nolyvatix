import { describe, it } from 'node:test';
import assert from 'node:assert';
import { WorkspaceService } from '../services/workspaceService.js';

describe('WorkspaceService', () => {
  it('should seed default workspaces on initialization', async () => {
    const svc = new WorkspaceService();
    const all = await svc.getAllWorkspaces();
    assert.ok(all.length >= 2, 'Should have at least 2 seeded workspaces');

    const defaultWs = all.find((w) => w.isDefault);
    assert.ok(defaultWs, 'Should have a default workspace');
    assert.strictEqual(defaultWs!.role, 'owner');
    assert.ok(defaultWs!.workspace.favoriteDashboards.length > 0);
  });

  it('should return active workspace data', async () => {
    const svc = new WorkspaceService();
    const active = await svc.getActiveWorkspace();
    assert.ok(active.id);
    assert.ok(active.name);
    assert.ok(active.workspace.recentSearches.length > 0);
  });

  it('should create a new workspace', async () => {
    const svc = new WorkspaceService();
    const ws = await svc.createWorkspace('Research Lab', 'Testing Soroban contracts', 'editor');
    assert.ok(ws.id.startsWith('ws-'));
    assert.strictEqual(ws.name, 'Research Lab');
    assert.strictEqual(ws.role, 'editor');
    assert.strictEqual(ws.isDefault, false);
    assert.strictEqual(ws.workspace.favoriteDashboards.length, 0);
  });

  it('should switch active workspace', async () => {
    const svc = new WorkspaceService();
    const created = await svc.createWorkspace('Alt Workspace');
    await svc.switchWorkspace(created.id);
    const active = await svc.getActiveWorkspace();
    assert.strictEqual(active.id, created.id);
    assert.strictEqual(active.name, 'Alt Workspace');
  });

  it('should update workspace metadata', async () => {
    const svc = new WorkspaceService();
    const updated = await svc.updateWorkspace('ws-testnet', { name: 'Futurenet Dev' });
    assert.strictEqual(updated.name, 'Futurenet Dev');
  });

  it('should delete a non-default workspace', async () => {
    const svc = new WorkspaceService();
    const result = await svc.deleteWorkspace('ws-testnet');
    assert.strictEqual(result, true);
    const all = await svc.getAllWorkspaces();
    assert.ok(!all.find((w) => w.id === 'ws-testnet'));
  });

  it('should throw when deleting default workspace', async () => {
    const svc = new WorkspaceService();
    await assert.rejects(
      () => svc.deleteWorkspace('ws-default'),
      /Cannot delete the default workspace/
    );
  });

  it('should generate shareable link with token', async () => {
    const svc = new WorkspaceService();
    const result = await svc.generateShareLink('ws-default');
    assert.ok(result.shareToken.length > 0);
    assert.ok(result.shareUrl.includes(result.shareToken));
  });

  it('should resolve share token as viewer role', async () => {
    const svc = new WorkspaceService();
    const { shareToken } = await svc.generateShareLink('ws-default');
    const resolved = await svc.resolveShareToken(shareToken);
    assert.ok(resolved);
    assert.strictEqual(resolved!.role, 'viewer');
    assert.strictEqual(resolved!.id, 'ws-default');
  });

  it('should toggle pin state for assets', async () => {
    const svc = new WorkspaceService();
    const ws = await svc.getWorkspace();
    const beforeCount = ws.pinnedAssets.length;
    await svc.togglePin('assets', 'AQUA:GBXYZ123');
    const after = await svc.getWorkspace();
    assert.strictEqual(after.pinnedAssets.length, beforeCount + 1);
    assert.ok(after.pinnedAssets.includes('AQUA:GBXYZ123'));

    // Unpin
    await svc.togglePin('assets', 'AQUA:GBXYZ123');
    const afterUnpin = await svc.getWorkspace();
    assert.strictEqual(afterUnpin.pinnedAssets.length, beforeCount);
  });

  it('should manage search history', async () => {
    const svc = new WorkspaceService();
    await svc.addRecentSearch('USDC liquidity pool');
    const ws1 = await svc.getWorkspace();
    assert.strictEqual(ws1.recentSearches[0], 'USDC liquidity pool');

    await svc.clearSearchHistory();
    const ws2 = await svc.getWorkspace();
    assert.strictEqual(ws2.recentSearches.length, 0);
  });

  it('should save and remove AI conversations', async () => {
    const svc = new WorkspaceService();
    const before = (await svc.getWorkspace()).savedAIConversations.length;
    await svc.saveAIConversation('Gas Optimization Deep Dive');
    const after = await svc.getWorkspace();
    assert.strictEqual(after.savedAIConversations.length, before + 1);
    assert.strictEqual(after.savedAIConversations[0].title, 'Gas Optimization Deep Dive');

    // Remove it
    const chatId = after.savedAIConversations[0].id;
    await svc.removeAIConversation(chatId);
    const final = await svc.getWorkspace();
    assert.ok(!final.savedAIConversations.find((c) => c.id === chatId));
  });
});
