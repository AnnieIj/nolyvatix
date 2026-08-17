/**
 * Nolyvatix Data Engine - Platform Settings & Preferences Service
 * Manages user preferences, theme, network settings, AI configuration, export defaults, and keyboard shortcuts
 * Scoped per authenticated tenant / user
 */

import { PlatformSettings } from '../../types/index.ts';
import { Logger } from '../utils/logger.ts';

const logger = new Logger('SettingsService');

export class SettingsService {
  private defaultSettings: PlatformSettings = {
    theme: 'dark',
    refreshIntervalSeconds: 10,
    networkPreference: 'mainnet',
    aiModel: 'gemini-2.5-flash',
    notificationsEnabled: true,
    exportFormatDefault: 'pdf',
    keyboardShortcutsEnabled: true,
  };

  private settingsByUser: Map<number, PlatformSettings> = new Map();

  async getSettings(userId = 1): Promise<PlatformSettings> {
    if (!this.settingsByUser.has(userId)) {
      this.settingsByUser.set(userId, { ...this.defaultSettings });
    }
    return this.settingsByUser.get(userId)!;
  }

  async updateSettings(updates: Partial<PlatformSettings>, userId = 1): Promise<PlatformSettings> {
    const current = await this.getSettings(userId);
    const updated = { ...current, ...updates };
    this.settingsByUser.set(userId, updated);
    logger.info(`Updated user ${userId} platform settings:`, updates);
    return updated;
  }
}
