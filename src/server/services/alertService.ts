/**
 * Nolyvatix Data Engine - Enterprise Alert & Notification Center Service
 * Supports multi-channel dispatch (Browser, Email, Webhooks, Slack, Discord),
 * alert history tracking, acknowledgment, stats, and real-time evaluation.
 */

import {
  AlertRule,
  AlertTarget,
  AlertChannel,
  AlertSeverity,
  AlertHistoryEntry,
  AlertStats,
} from '../../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('AlertService');

/**
 * Evaluates whether a currentValue breaches an alert condition.
 */
function evaluateCondition(condition: 'above' | 'below' | 'equals', threshold: number, current: number): boolean {
  switch (condition) {
    case 'above':  return current > threshold;
    case 'below':  return current < threshold;
    case 'equals': return current === threshold;
  }
}

/**
 * Derives severity from how far outside the threshold the current value is.
 */
function deriveSeverity(alert: AlertRule, currentValue: number): AlertSeverity {
  if (alert.severity) return alert.severity;
  const deviation = Math.abs((currentValue - alert.threshold) / (alert.threshold || 1));
  if (deviation >= 0.5) return 'critical';
  if (deviation >= 0.2) return 'warning';
  return 'info';
}

export class AlertService {
  private alerts: Map<string, AlertRule> = new Map();
  private history: Map<string, AlertHistoryEntry> = new Map(); // historyId → entry

  constructor() {
    this.seedDefaultAlerts();
  }

  // ─────────────────────────────────────────────
  //  Seed
  // ─────────────────────────────────────────────

  private seedDefaultAlerts() {
    const defaults: AlertRule[] = [
      {
        id: 'alt-tps-drop',
        name: 'Stellar Mainnet Throughput TPS Drop Alert',
        target: 'tps_drops',
        condition: 'below',
        threshold: 25,
        channel: 'browser',
        severity: 'critical',
        enabled: true,
        lastTriggered: new Date(Date.now() - 3600000).toISOString(),
        triggerCount: 3,
      },
      {
        id: 'alt-whale-move',
        name: 'Whale Movement > 1,000,000 XLM Transfer',
        target: 'whale_movement',
        condition: 'above',
        threshold: 1000000,
        channel: 'discord',
        severity: 'warning',
        destination: 'https://discord.com/api/webhooks/stellar-whales',
        enabled: true,
        triggerCount: 7,
      },
      {
        id: 'alt-soroban-fail',
        name: 'Soroban WASM Contract Execution Failure Spike',
        target: 'soroban_failure',
        condition: 'above',
        threshold: 5,
        channel: 'slack',
        severity: 'critical',
        destination: 'https://hooks.slack.com/services/T00/B00/XXXXX',
        enabled: true,
        triggerCount: 1,
      },
      {
        id: 'alt-usdc-trustline',
        name: 'Circle USDC Trustline Spike (+500 / hr)',
        target: 'trustline_spike',
        condition: 'above',
        threshold: 500,
        channel: 'webhook',
        severity: 'info',
        destination: 'https://api.nolyvatix.io/webhooks/trustlines',
        enabled: true,
        triggerCount: 0,
      },
      {
        id: 'alt-liquidity-drop',
        name: 'AMM Liquidity Pool TVL Drop > 20%',
        target: 'liquidity_drop',
        condition: 'below',
        threshold: 80,
        channel: 'browser',
        severity: 'warning',
        enabled: true,
        triggerCount: 2,
      },
      {
        id: 'alt-network-health',
        name: 'Stellar Network Health Degradation',
        target: 'network_health',
        condition: 'below',
        threshold: 95,
        channel: 'email',
        severity: 'critical',
        destination: 'ops@nolyvatix.io',
        enabled: true,
        triggerCount: 0,
      },
    ];

    defaults.forEach((a) => this.alerts.set(a.id, a));

    // Seed some sample history entries for the first alert
    this.seedSampleHistory();
  }

  private seedSampleHistory() {
    const sampleAlertId = 'alt-tps-drop';
    const alert = this.alerts.get(sampleAlertId)!;

    const sampleEntries: AlertHistoryEntry[] = [
      {
        id: `hist-seed-001`,
        alertId: sampleAlertId,
        alertName: alert.name,
        target: alert.target,
        channel: alert.channel,
        severity: 'critical',
        triggeredAt: new Date(Date.now() - 7200000).toISOString(), // 2h ago
        currentValue: 18,
        threshold: alert.threshold,
        condition: alert.condition,
        acknowledged: true,
        acknowledgedAt: new Date(Date.now() - 6900000).toISOString(),
        payload: { ledgerSequence: 52147800, network: 'Stellar Mainnet' },
      },
      {
        id: `hist-seed-002`,
        alertId: sampleAlertId,
        alertName: alert.name,
        target: alert.target,
        channel: alert.channel,
        severity: 'critical',
        triggeredAt: new Date(Date.now() - 3600000).toISOString(), // 1h ago
        currentValue: 12,
        threshold: alert.threshold,
        condition: alert.condition,
        acknowledged: false,
        payload: { ledgerSequence: 52148200, network: 'Stellar Mainnet' },
      },
    ];

    sampleEntries.forEach((e) => this.history.set(e.id, e));
  }

  // ─────────────────────────────────────────────
  //  CRUD
  // ─────────────────────────────────────────────

  async getAllAlerts(): Promise<AlertRule[]> {
    return Array.from(this.alerts.values());
  }

  async getAlertById(id: string): Promise<AlertRule | null> {
    return this.alerts.get(id) || null;
  }

  async createAlert(data: Partial<AlertRule>): Promise<AlertRule> {
    const id = `alt-${Date.now()}`;
    const newAlert: AlertRule = {
      id,
      name: data.name || 'Custom Stellar Threshold Alert',
      target: data.target || 'tps_drops',
      condition: data.condition || 'below',
      threshold: data.threshold ?? 30,
      channel: data.channel || 'browser',
      destination: data.destination || '',
      severity: data.severity || 'warning',
      enabled: data.enabled ?? true,
      triggerCount: 0,
    };

    this.alerts.set(id, newAlert);
    logger.info(`Created alert rule ${id}: ${newAlert.name}`);
    return newAlert;
  }

  async updateAlert(id: string, updates: Partial<AlertRule>): Promise<AlertRule> {
    const existing = this.alerts.get(id);
    if (!existing) {
      throw new Error(`Alert rule ${id} not found`);
    }

    const updated = { ...existing, ...updates };
    this.alerts.set(id, updated);
    logger.info(`Updated alert rule ${id}`);
    return updated;
  }

  async deleteAlert(id: string): Promise<boolean> {
    const deleted = this.alerts.delete(id);
    if (deleted) {
      logger.info(`Deleted alert rule ${id}`);
    }
    return deleted;
  }

  // ─────────────────────────────────────────────
  //  Evaluation & Dispatch
  // ─────────────────────────────────────────────

  /**
   * Evaluates a live currentValue against an alert rule, dispatches if breached.
   * Called by the test-trigger endpoint (simulated) and can be called by polling logic.
   */
  async evaluateAndDispatch(id: string, currentValue: number): Promise<AlertHistoryEntry | null> {
    const alert = this.alerts.get(id);
    if (!alert || !alert.enabled) return null;

    const breached = evaluateCondition(alert.condition, alert.threshold, currentValue);
    if (!breached) return null;

    return this.dispatchAlert(alert, currentValue, {
      triggeredBy: 'evaluation',
      network: 'Stellar Mainnet',
    });
  }

  /**
   * Manually fires an alert (test trigger) with a simulated value.
   */
  async testTriggerAlert(id: string): Promise<{ success: boolean; channel: AlertChannel; entry: AlertHistoryEntry }> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error(`Alert rule ${id} not found`);
    }

    const simulatedValue = alert.condition === 'above' ? alert.threshold * 1.25 : alert.threshold * 0.75;
    const entry = await this.dispatchAlert(alert, simulatedValue, {
      triggeredBy: 'manual-test',
      txHash: 'e7a419f854b7264858d4a942a19cf783e4c6f9e0132b8429ad104975f28c2920',
      ledgerSequence: 52148902,
      sourceAccount: 'GAAZI4TCR3TY5OJHCTJC2A4AFLA23OIB4X3A6NE3AM3A7EUJ5YATAG22',
      network: 'Stellar Mainnet',
    });

    return { success: true, channel: alert.channel, entry };
  }

  private async dispatchAlert(
    alert: AlertRule,
    currentValue: number,
    extraPayload: Record<string, any>
  ): Promise<AlertHistoryEntry> {
    const now = new Date().toISOString();
    const historyId = `hist-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const severity = deriveSeverity(alert, currentValue);

    const entry: AlertHistoryEntry = {
      id: historyId,
      alertId: alert.id,
      alertName: alert.name,
      target: alert.target,
      channel: alert.channel,
      severity,
      triggeredAt: now,
      currentValue,
      threshold: alert.threshold,
      condition: alert.condition,
      acknowledged: false,
      payload: {
        alertId: alert.id,
        alertName: alert.name,
        currentValue,
        threshold: alert.threshold,
        condition: alert.condition,
        timestamp: now,
        ...extraPayload,
      },
    };

    this.history.set(historyId, entry);

    // Update the alert itself
    alert.lastTriggered = now;
    alert.triggerCount = (alert.triggerCount ?? 0) + 1;
    this.alerts.set(alert.id, alert);

    logger.info(`Dispatched ${severity.toUpperCase()} alert ${alert.id} → ${alert.channel} (value=${currentValue}, threshold=${alert.threshold})`);
    return entry;
  }

  // ─────────────────────────────────────────────
  //  History
  // ─────────────────────────────────────────────

  async getAlertHistory(alertId?: string): Promise<AlertHistoryEntry[]> {
    const all = Array.from(this.history.values());
    const filtered = alertId ? all.filter((h) => h.alertId === alertId) : all;
    return filtered.sort((a, b) => new Date(b.triggeredAt).getTime() - new Date(a.triggeredAt).getTime());
  }

  async acknowledgeAlert(historyId: string): Promise<AlertHistoryEntry> {
    const entry = this.history.get(historyId);
    if (!entry) {
      throw new Error(`Alert history entry ${historyId} not found`);
    }

    entry.acknowledged = true;
    entry.acknowledgedAt = new Date().toISOString();
    this.history.set(historyId, entry);
    logger.info(`Acknowledged alert history entry ${historyId}`);
    return entry;
  }

  async acknowledgeAllForAlert(alertId: string): Promise<number> {
    let count = 0;
    const now = new Date().toISOString();
    for (const [id, entry] of this.history) {
      if (entry.alertId === alertId && !entry.acknowledged) {
        entry.acknowledged = true;
        entry.acknowledgedAt = now;
        this.history.set(id, entry);
        count++;
      }
    }
    logger.info(`Bulk-acknowledged ${count} history entries for alert ${alertId}`);
    return count;
  }

  // ─────────────────────────────────────────────
  //  Stats
  // ─────────────────────────────────────────────

  async getAlertStats(): Promise<AlertStats> {
    const rules = Array.from(this.alerts.values());
    const allHistory = Array.from(this.history.values());
    const last24hCutoff = Date.now() - 86400000;

    const channelBreakdown: Record<AlertChannel, number> = {
      browser: 0,
      email: 0,
      webhook: 0,
      slack: 0,
      discord: 0,
    };

    rules.forEach((r) => {
      channelBreakdown[r.channel] = (channelBreakdown[r.channel] || 0) + 1;
    });

    const last24hHistory = allHistory.filter((h) => new Date(h.triggeredAt).getTime() >= last24hCutoff);

    return {
      totalRules: rules.length,
      enabledRules: rules.filter((r) => r.enabled).length,
      disabledRules: rules.filter((r) => !r.enabled).length,
      totalTriggeredLast24h: last24hHistory.length,
      unacknowledgedCount: allHistory.filter((h) => !h.acknowledged).length,
      criticalCount: last24hHistory.filter((h) => h.severity === 'critical').length,
      warningCount: last24hHistory.filter((h) => h.severity === 'warning').length,
      channelBreakdown,
    };
  }
}
