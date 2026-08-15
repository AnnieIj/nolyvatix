import { relations } from 'drizzle-orm';
import {
  boolean,
  integer,
  jsonb,
  pgTable,
  serial,
  text,
  timestamp,
  varchar,
} from 'drizzle-orm/pg-core';

// 1. Users Table (keyed by Firebase Auth UID)
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  uid: varchar('uid', { length: 128 }).notNull().unique(),
  email: text('email').notNull(),
  displayName: text('display_name'),
  avatarUrl: text('avatar_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 2. Dashboards Table
export const dashboards = pgTable('dashboards', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  layout: jsonb('layout').notNull().default({ columns: 3, rows: 'auto' }),
  widgets: jsonb('widgets').notNull().default([]),
  isDefault: boolean('is_default').default(false).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// 3. Reports & Custom Analytics Definitions
export const reports = pgTable('reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  description: text('description'),
  templateType: varchar('template_type', { length: 64 }).notNull().default('EXECUTIVE_SUMMARY'),
  config: jsonb('config').notNull().default({}),
  schedule: varchar('schedule', { length: 64 }), // e.g., 'HOURLY', 'DAILY', 'WEEKLY', 'MANUAL'
  lastGeneratedAt: timestamp('last_generated_at'),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// 4. Alert Rules
export const alertRules = pgTable('alert_rules', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  metricType: varchar('metric_type', { length: 64 }).notNull(), // 'TPS_DROP', 'FEE_SPIKE', 'LEDGER_DELAY', 'CONTRACT_FAIL', 'BALANCE_THRESHOLD'
  condition: varchar('condition', { length: 32 }).notNull(), // 'GREATER_THAN', 'LESS_THAN', 'EQUALS', 'CHANGES_BY_PCT'
  threshold: varchar('threshold', { length: 64 }).notNull(),
  severity: varchar('severity', { length: 32 }).notNull().default('MEDIUM'), // 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
  channels: jsonb('channels').notNull().default(['IN_APP']), // ['IN_APP', 'WEBHOOK', 'EMAIL']
  isEnabled: boolean('is_enabled').default(true).notNull(),
  lastTriggeredAt: timestamp('last_triggered_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// 5. Bookmarks (Accounts, Contracts, Ledgers, Transactions)
export const bookmarks = pgTable('bookmarks', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  itemType: varchar('item_type', { length: 64 }).notNull(), // 'ACCOUNT', 'CONTRACT', 'LEDGER', 'TRANSACTION', 'ASSET'
  itemId: text('item_id').notNull(),
  label: varchar('label', { length: 255 }).notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 6. Saved Searches
export const savedSearches = pgTable('saved_searches', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  query: text('query').notNull(),
  filterCategory: varchar('filter_category', { length: 64 }).default('ALL').notNull(),
  criteria: jsonb('criteria').default({}),
  useCount: integer('use_count').default(1).notNull(),
  lastUsedAt: timestamp('last_used_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 7. Workspace Preferences
export const workspacePreferences = pgTable('workspace_preferences', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull()
    .unique(),
  defaultNetwork: varchar('default_network', { length: 32 }).default('mainnet').notNull(),
  theme: varchar('theme', { length: 32 }).default('dark').notNull(),
  refreshIntervalMs: integer('refresh_interval_ms').default(5000).notNull(),
  defaultHorizonUrl: text('default_horizon_url'),
  defaultSorobanUrl: text('default_soroban_url'),
  telemetryPreferences: jsonb('telemetry_preferences').default({
    liveStreamEnabled: true,
    soundAlerts: false,
    compactTables: false,
  }),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// 8. AI Copilot Conversations & Chats
export const aiConversations = pgTable('ai_conversations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  title: varchar('title', { length: 255 }).notNull().default('New AI Session'),
  messages: jsonb('messages').notNull().default([]), // array of { id, role, content, timestamp, citations, suggestedActions }
  modelUsed: varchar('model_used', { length: 64 }).default('gemini-2.5-flash').notNull(),
  tokensUsed: integer('tokens_used').default(0).notNull(),
  isArchived: boolean('is_archived').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// 9. Exported Reports (PDF, CSV, JSON)
export const exportedReports = pgTable('exported_reports', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  reportId: integer('report_id').references(() => reports.id, { onDelete: 'set null' }),
  format: varchar('format', { length: 16 }).notNull(), // 'PDF', 'CSV', 'JSON'
  fileName: varchar('file_name', { length: 255 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').default(0).notNull(),
  downloadUrl: text('download_url'),
  status: varchar('status', { length: 32 }).default('COMPLETED').notNull(), // 'PENDING', 'GENERATING', 'COMPLETED', 'FAILED'
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at'),
});

// 10. Webhook Configurations
export const webhookConfigurations = pgTable('webhook_configurations', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  endpointUrl: text('endpoint_url').notNull(),
  events: jsonb('events').notNull().default(['ALERT_TRIGGERED', 'LEDGER_ANOMALY']),
  secretKey: varchar('secret_key', { length: 255 }),
  isEnabled: boolean('is_enabled').default(true).notNull(),
  failureCount: integer('failure_count').default(0).notNull(),
  lastSuccessAt: timestamp('last_success_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  deletedAt: timestamp('deleted_at'),
});

// 11. Notification & Alert History
export const notificationHistory = pgTable('notification_history', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .references(() => users.id, { onDelete: 'cascade' })
    .notNull(),
  alertRuleId: integer('alert_rule_id').references(() => alertRules.id, { onDelete: 'set null' }),
  title: varchar('title', { length: 255 }).notNull(),
  message: text('message').notNull(),
  severity: varchar('severity', { length: 32 }).default('MEDIUM').notNull(),
  status: varchar('status', { length: 32 }).default('TRIGGERED').notNull(), // 'TRIGGERED', 'RESOLVED', 'ACKNOWLEDGED'
  deliveryChannel: varchar('delivery_channel', { length: 32 }).default('IN_APP').notNull(),
  isRead: boolean('is_read').default(false).notNull(),
  metadata: jsonb('metadata').default({}),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Relational Definitions
export const usersRelations = relations(users, ({ many, one }) => ({
  dashboards: many(dashboards),
  reports: many(reports),
  alertRules: many(alertRules),
  bookmarks: many(bookmarks),
  savedSearches: many(savedSearches),
  aiConversations: many(aiConversations),
  exportedReports: many(exportedReports),
  webhookConfigurations: many(webhookConfigurations),
  notifications: many(notificationHistory),
  preferences: one(workspacePreferences, {
    fields: [users.id],
    references: [workspacePreferences.userId],
  }),
}));

export const dashboardsRelations = relations(dashboards, ({ one }) => ({
  author: one(users, {
    fields: [dashboards.userId],
    references: [users.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one, many }) => ({
  author: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
  exports: many(exportedReports),
}));

export const alertRulesRelations = relations(alertRules, ({ one, many }) => ({
  author: one(users, {
    fields: [alertRules.userId],
    references: [users.id],
  }),
  notifications: many(notificationHistory),
}));
