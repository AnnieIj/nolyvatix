/**
 * Nolyvatix Data Engine - Platform Settings & Preferences Service
 * Manages user preferences, theme, network settings, AI configuration, export defaults, and keyboard shortcuts
 */

import { PlatformSettings } from '../../types/index.js';
import { Logger } from '../utils/logger.js';

const logger = new Logger('SettingsService');

export class SettingsService {
  private settings: PlatformSettings = {
    theme: 'dark',
    refreshIntervalSeconds: 10,
    networkPreference: 'mainnet',
    aiModel: 'gemini-2.5-flash',
    notificationsEnabled: true,
    exportFormatDefault: 'pdf',
    keyboardShortcutsEnabled: true,
  };

  async getSettings(): Promise<PlatformSettings> {
    return this.settings;
  }

  async updateSettings(updates: Partial<PlatformSettings>): Promise<PlatformSettings> {
    this.settings = { ...this.settings, ...updates };
    logger.info('Updated user platform settings:', updates);
    return this.settings;
  }
}
