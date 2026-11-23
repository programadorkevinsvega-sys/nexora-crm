import { pgSchema, uuid, varchar, text, boolean, integer, timestamp, jsonb, index } from 'drizzle-orm/pg-core'

export const notificationsSchema = pgSchema('notifications')

export const notificationChannels = notificationsSchema.table('notification_channels', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  providerType: varchar('provider_type', { length: 50 }).notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  configJson: jsonb('config_json').notNull().default({}),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const notificationTemplates = notificationsSchema.table('notification_templates', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  templateKey: varchar('template_key', { length: 150 }).notNull(),
  subjectTemplate: text('subject_template').notNull(),
  bodyTemplate: text('body_template').notNull(),
  variablesJson: jsonb('variables_json').default([]),
  locale: varchar('locale', { length: 10 }).default('en'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const notificationQueue = notificationsSchema.table('notification_queue', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  channelId: uuid('channel_id'),
  templateId: uuid('template_id'),
  toAddress: varchar('to_address', { length: 500 }).notNull(),
  subject: text('subject'),
  body: text('body'),
  variablesUsedJson: jsonb('variables_used_json'),
  status: varchar('status', { length: 50 }).notNull().default('PENDING'),
  priority: integer('priority').default(0),
  attempts: integer('attempts').notNull().default(0),
  maxAttempts: integer('max_attempts').default(3),
  lastError: text('last_error'),
  scheduledAt: timestamp('scheduled_at', { withTimezone: true }),
  sentAt: timestamp('sent_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  statusScheduledIdx: index('idx_notif_queue_status_scheduled').on(table.status, table.scheduledAt),
  channelStatusIdx: index('idx_notif_queue_channel_status').on(table.channelType, table.status),
}))

export const notificationLogs = notificationsSchema.table('notification_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  queueId: uuid('queue_id'),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  toAddress: varchar('to_address', { length: 500 }).notNull(),
  subject: text('subject'),
  bodyPreview: text('body_preview'),
  status: varchar('status', { length: 50 }).notNull(),
  providerUsed: varchar('provider_used', { length: 100 }),
  providerMessageId: varchar('provider_message_id', { length: 255 }),
  errorMessage: text('error_message'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow().notNull(),
})

export const notificationPreferences = notificationsSchema.table('notification_preferences', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id'),
  userId: uuid('user_id').notNull(),
  channelType: varchar('channel_type', { length: 50 }).notNull(),
  isEnabled: boolean('is_enabled').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})
