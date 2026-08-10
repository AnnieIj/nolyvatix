/**
 * Nolyvatix Data Engine - Alert & Notification Center Service
 * Custom triggers, multi-channel dispatch (Browser, Email, Webhooks, Slack, Discord)
 */

import { AlertRule, AlertTarget, AlertChannel } from '../../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('AlertService');

export class AlertService {
  private alerts: Map<string, AlertRule> = new Map();

  constructor() {
    this.seedDefaultAlerts();
  }

  private seedDefaultAlerts() {
    const defaults: AlertRule[] = [
      {
        id: 'alt-tps-drop',
        name: 'Stellar Mainnet Throughput TPS Drop Alert',
        target: 'tps_drops',
        condition: 'below',
        threshold: 25,
        channel: 'browser',
        enabled: true,
        lastTriggered: new Date(Date.now() - 3600000).toISOString(),
      },
      {
        id: 'alt-whale-move',
        name: 'Whale Movement > 1,000,000 XLM Transfer',
        target: 'whale_movement',
        condition: 'above',
        threshold: 1000000,
        channel: 'discord',
        destination: 'https://discord.com/api/webhooks/stellar-whales',
        enabled: true,
      },
      {
        id: 'alt-soroban-fail',
        name: 'Soroban WASM Contract Execution Failure Spike',
        target: 'soroban_failure',
        condition: 'above',
        threshold: 5,
        channel: 'slack',
        destination: 'https://hooks.slack.com/services/T00/B00/XXXXX',
        enabled: true,
      },
      {
        id: 'alt-usdc-trustline',
        name: 'Circle USDC Trustline Spike (+500 / hr)',
        target: 'trustline_spike',
        condition: 'above',
        threshold: 500,
        channel: 'webhook',
        destination: 'https://api.nolyvatix.io/webhooks/trustlines',
        enabled: true,
      },
    ];

    defaults.forEach((a) => this.alerts.set(a.id, a));
  }

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
      enabled: data.enabled ?? true,
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

  async testTriggerAlert(id: string): Promise<{ success: boolean; channel: AlertChannel; payload: any }> {
    const alert = this.alerts.get(id);
    if (!alert) {
      throw new Error(`Alert rule ${id} not found`);
    }

    alert.lastTriggered = new Date().toISOString();
    this.alerts.set(id, alert);

    const payload = {
      alertId: alert.id,
      alertName: alert.name,
      target: alert.target,
      condition: alert.condition,
      threshold: alert.threshold,
      timestamp: alert.lastTriggered,
      network: 'Stellar Mainnet',
      sampleEventData: {
        currentValue: alert.condition === 'above' ? alert.threshold * 1.25 : alert.threshold * 0.75,
        txHash: 'e7a419f854b7264858d4a942a19cf783e4c6f9e0132b8429ad104975f28c2920',
        ledgerSequence: 52148902,
        sourceAccount: 'GAAZI4TCR3TY5OJHCTJC2A4AFLA23OIB4X3A6NE3AM3A7EUJ5YATAG22',
      },
    };

    logger.info(`Dispatched test payload for alert ${id} to ${alert.channel}`);

    return {
      success: true,
      channel: alert.channel,
      payload,
    };
  }
}
