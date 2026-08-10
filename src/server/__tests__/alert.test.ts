import { describe, it } from 'node:test';
import assert from 'node:assert';
import { AlertService } from '../services/alertService.js';

describe('AlertService', () => {
  it('should seed default alert rules on initialization', async () => {
    const svc = new AlertService();
    const alerts = await svc.getAllAlerts();
    assert.ok(alerts.length >= 4, 'Should seed at least 4 default alert rules');
    assert.ok(alerts.every((a) => a.id && a.name && a.target && a.threshold));
  });

  it('should create a new custom alert rule', async () => {
    const svc = new AlertService();
    const created = await svc.createAlert({
      name: 'Test DEX Volume Spike',
      target: 'dex_volume_spike',
      condition: 'above',
      threshold: 1000000,
      channel: 'webhook',
      destination: 'https://hooks.example.com/dex',
      severity: 'warning',
    });

    assert.ok(created.id.startsWith('alt-'));
    assert.strictEqual(created.name, 'Test DEX Volume Spike');
    assert.strictEqual(created.target, 'dex_volume_spike');
    assert.strictEqual(created.severity, 'warning');
    assert.strictEqual(created.enabled, true);
    assert.strictEqual(created.triggerCount, 0);
  });

  it('should update an existing alert rule', async () => {
    const svc = new AlertService();
    const updated = await svc.updateAlert('alt-tps-drop', { threshold: 15, enabled: false });
    assert.strictEqual(updated.threshold, 15);
    assert.strictEqual(updated.enabled, false);
  });

  it('should throw when updating a non-existent alert', async () => {
    const svc = new AlertService();
    await assert.rejects(
      () => svc.updateAlert('alt-nonexistent', { threshold: 1 }),
      /not found/i
    );
  });

  it('should delete an alert rule', async () => {
    const svc = new AlertService();
    const result = await svc.deleteAlert('alt-usdc-trustline');
    assert.strictEqual(result, true);
    const fetched = await svc.getAlertById('alt-usdc-trustline');
    assert.strictEqual(fetched, null);
  });

  it('should test-trigger an alert and log it to history', async () => {
    const svc = new AlertService();
    const { success, channel, entry } = await svc.testTriggerAlert('alt-whale-move');

    assert.strictEqual(success, true);
    assert.strictEqual(channel, 'discord');
    assert.ok(entry.id.startsWith('hist-'));
    assert.strictEqual(entry.alertId, 'alt-whale-move');
    assert.strictEqual(entry.acknowledged, false);
    assert.ok(entry.currentValue > entry.threshold); // "above" threshold
  });

  it('should evaluate and dispatch when threshold is breached', async () => {
    const svc = new AlertService();
    // alt-tps-drop: below 25 → value 10 should breach
    const entry = await svc.evaluateAndDispatch('alt-tps-drop', 10);
    assert.ok(entry !== null, 'Should create history entry when breached');
    assert.strictEqual(entry!.alertId, 'alt-tps-drop');
    assert.strictEqual(entry!.currentValue, 10);
    assert.strictEqual(entry!.acknowledged, false);
    assert.strictEqual(entry!.severity, 'critical');
  });

  it('should NOT dispatch when threshold is NOT breached', async () => {
    const svc = new AlertService();
    // alt-tps-drop: below 25 → value 50 should NOT breach
    const entry = await svc.evaluateAndDispatch('alt-tps-drop', 50);
    assert.strictEqual(entry, null);
  });

  it('should return history sorted by triggeredAt descending', async () => {
    const svc = new AlertService();
    await svc.testTriggerAlert('alt-tps-drop');
    const history = await svc.getAlertHistory();
    assert.ok(history.length >= 2);
    for (let i = 0; i < history.length - 1; i++) {
      assert.ok(
        new Date(history[i].triggeredAt).getTime() >= new Date(history[i + 1].triggeredAt).getTime(),
        'History should be sorted descending by triggeredAt'
      );
    }
  });

  it('should filter history by alertId', async () => {
    const svc = new AlertService();
    await svc.testTriggerAlert('alt-tps-drop');
    await svc.testTriggerAlert('alt-whale-move');

    const tpsHistory = await svc.getAlertHistory('alt-tps-drop');
    assert.ok(tpsHistory.every((h) => h.alertId === 'alt-tps-drop'));
    assert.ok(tpsHistory.length >= 1);
  });

  it('should acknowledge a specific history entry', async () => {
    const svc = new AlertService();
    await svc.testTriggerAlert('alt-tps-drop');
    const history = await svc.getAlertHistory('alt-tps-drop');

    // pick an unacknowledged entry
    const unacked = history.find((h) => !h.acknowledged);
    assert.ok(unacked, 'Should have at least one unacknowledged entry');

    const acked = await svc.acknowledgeAlert(unacked!.id);
    assert.strictEqual(acked.acknowledged, true);
    assert.ok(acked.acknowledgedAt);
  });

  it('should bulk acknowledge all history entries for an alert', async () => {
    const svc = new AlertService();
    await svc.testTriggerAlert('alt-tps-drop');
    await svc.testTriggerAlert('alt-tps-drop');

    const count = await svc.acknowledgeAllForAlert('alt-tps-drop');
    assert.ok(count >= 1);

    const history = await svc.getAlertHistory('alt-tps-drop');
    const stillUnacked = history.filter((h) => !h.acknowledged);
    assert.strictEqual(stillUnacked.length, 0);
  });

  it('should return correct alert stats', async () => {
    const svc = new AlertService();
    await svc.testTriggerAlert('alt-tps-drop');

    const stats = await svc.getAlertStats();
    assert.ok(stats.totalRules >= 4);
    assert.ok(stats.enabledRules > 0);
    assert.ok(stats.totalTriggeredLast24h >= 1);
    assert.ok(stats.unacknowledgedCount >= 1);
    assert.ok(typeof stats.channelBreakdown === 'object');
    assert.ok(stats.channelBreakdown.browser >= 1);
  });
});
