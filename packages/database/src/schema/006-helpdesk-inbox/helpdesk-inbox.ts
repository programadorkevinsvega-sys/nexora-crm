import { pgTable, uuid, varchar, text, timestamp, boolean, integer, date, serial, primaryKey, numeric } from 'drizzle-orm/pg-core'

export const helpdeskMailboxes = pgTable('crm_helpdesk_mailboxes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  emailAddress: varchar('email_address', { length: 255 }).notNull(),
  inboundHost: varchar('inbound_host', { length: 255 }),
  inboundPort: integer('inbound_port').default(993),
  inboundProtocol: varchar('inbound_protocol', { length: 20 }).default('IMAP'),
  inboundEncryption: varchar('inbound_encryption', { length: 20 }).default('SSL'),
  outboundHost: varchar('outbound_host', { length: 255 }),
  outboundPort: integer('outbound_port').default(465),
  outboundEncryption: varchar('outbound_encryption', { length: 20 }).default('SSL'),
  credentialsSecretId: varchar('credentials_secret_id', { length: 255 }),
  autoReplyEnabled: boolean('auto_reply_enabled').default(false),
  autoReplySubject: varchar('auto_reply_subject', { length: 255 }),
  autoReplyBody: text('auto_reply_body'),
  signatureHtml: text('signature_html'),
  isActive: boolean('is_active').default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskMailboxUsers = pgTable('crm_helpdesk_mailbox_users', {
  mailboxId: uuid('mailbox_id').notNull().references(() => helpdeskMailboxes.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  role: varchar('role', { length: 50 }).default('AGENT'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (t) => ({
  pk: primaryKey({ columns: [t.mailboxId, t.userId] }),
}))

export const helpdeskConversations = pgTable('crm_helpdesk_conversations', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  mailboxId: uuid('mailbox_id').notNull().references(() => helpdeskMailboxes.id),
  ticketNumber: serial('ticket_number'),
  subject: varchar('subject', { length: 255 }).notNull(),
  customerId: uuid('customer_id'),
  customerEmail: varchar('customer_email', { length: 255 }).notNull(),
  assigneeUserId: uuid('assignee_user_id'),
  status: varchar('status', { length: 50 }).default('OPEN'),
  priority: varchar('priority', { length: 20 }).default('NORMAL'),
  sourceChannel: varchar('source_channel', { length: 50 }).default('EMAIL'),
  previewText: varchar('preview_text', { length: 255 }),
  hasAttachments: boolean('has_attachments').default(false),
  lastReplyAt: timestamp('last_reply_at', { withTimezone: true }),
  lastReplyFrom: varchar('last_reply_from', { length: 50 }),
  closedAt: timestamp('closed_at', { withTimezone: true }),
  estimatedHours: numeric('estimated_hours', { precision: 8, scale: 2 }),
  workedHours: numeric('worked_hours', { precision: 8, scale: 2 }).default('0'),
  dueDate: timestamp('due_date', { withTimezone: true }),
  firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
  resolvedAt: timestamp('resolved_at', { withTimezone: true }),
  isInternal: boolean('is_internal').default(false),
  requiresApproval: boolean('requires_approval').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskFollowers = pgTable('crm_helpdesk_followers', {
  conversationId: uuid('conversation_id').notNull().references(() => helpdeskConversations.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').notNull(),
  addedAt: timestamp('added_at', { withTimezone: true }).defaultNow(),
}, (t) => ({
  pk: primaryKey({ columns: [t.conversationId, t.userId] }),
}))

export const helpdeskThreads = pgTable('crm_helpdesk_threads', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  conversationId: uuid('conversation_id').notNull().references(() => helpdeskConversations.id, { onDelete: 'cascade' }),
  threadType: varchar('thread_type', { length: 50 }).notNull(),
  createdByUserId: uuid('created_by_user_id'),
  createdByCustomerId: uuid('created_by_customer_id'),
  bodyHtml: text('body_html'),
  bodyText: text('body_text'),
  messageIdHeader: varchar('message_id_header', { length: 255 }),
  inReplyToHeader: varchar('in_reply_to_header', { length: 255 }),
  toAddresses: text('to_addresses'),
  ccAddresses: text('cc_addresses'),
  bccAddresses: text('bcc_addresses'),
  isDraft: boolean('is_draft').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const helpdeskAttachments = pgTable('crm_helpdesk_attachments', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  threadId: uuid('thread_id').notNull().references(() => helpdeskThreads.id, { onDelete: 'cascade' }),
  fileName: varchar('file_name', { length: 255 }).notNull(),
  mimeType: varchar('mime_type', { length: 100 }).notNull(),
  fileSizeBytes: integer('file_size_bytes').notNull(),
  storageUrl: text('storage_url').notNull(),
  isInline: boolean('is_inline').default(false),
  contentId: varchar('content_id', { length: 255 }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
