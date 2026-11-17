import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, primaryKey, unique } from 'drizzle-orm/pg-core'
import { helpdeskMailboxes } from '../006-helpdesk-inbox/helpdesk-inbox'
import { helpdeskConversations } from '../006-helpdesk-inbox/helpdesk-inbox'
import { helpdeskThreads } from '../006-helpdesk-inbox/helpdesk-inbox'

export const helpdeskFolders = pgTable('crm_helpdesk_folders', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  mailboxId: uuid('mailbox_id').notNull().references(() => helpdeskMailboxes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id'),
  name: varchar('name', { length: 255 }).notNull(),
  folderType: varchar('folder_type', { length: 50 }).default('CUSTOM'),
  totalCount: integer('total_count').default(0),
  activeCount: integer('active_count').default(0),
  metadataJson: jsonb('metadata_json').default({}),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskConversationFolders = pgTable('crm_helpdesk_conversation_folders', {
  folderId: uuid('folder_id').notNull().references(() => helpdeskFolders.id, { onDelete: 'cascade' }),
  conversationId: uuid('conversation_id').notNull().references(() => helpdeskConversations.id, { onDelete: 'cascade' }),
}, (t) => ({
  pk: primaryKey({ columns: [t.folderId, t.conversationId] }),
}))

export const helpdeskCustomerEmails = pgTable('crm_helpdesk_customer_emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  customerId: uuid('customer_id').notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  emailType: varchar('email_type', { length: 50 }).default('PRIMARY'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskSendLogs = pgTable('crm_helpdesk_send_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  threadId: uuid('thread_id').references(() => helpdeskThreads.id, { onDelete: 'set null' }),
  customerId: uuid('customer_id'),
  userId: uuid('user_id'),
  messageId: varchar('message_id', { length: 255 }),
  recipientEmail: varchar('recipient_email', { length: 255 }).notNull(),
  emailType: varchar('email_type', { length: 50 }),
  deliveryStatus: varchar('delivery_status', { length: 50 }).notNull(),
  statusMessage: text('status_message'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskSubscriptions = pgTable('crm_helpdesk_subscriptions', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  userId: uuid('user_id').notNull(),
  notificationChannel: varchar('notification_channel', { length: 50 }).notNull(),
  eventType: varchar('event_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  uniq: unique().on(t.tenantId, t.userId, t.notificationChannel, t.eventType),
}))
