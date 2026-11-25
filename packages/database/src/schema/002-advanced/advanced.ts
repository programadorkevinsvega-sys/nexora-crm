import { pgTable, uuid, varchar, timestamp, numeric, text, date, boolean } from 'drizzle-orm/pg-core'
import { contacts } from '../001-core/contacts'
import { deals } from '../001-core/deals'

export const contactRelationships = pgTable('contact_relationships', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  primaryContactId: uuid('primary_contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  relatedContactId: uuid('related_contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  relationshipType: varchar('relationship_type', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const campaigns = pgTable('campaigns', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 255 }).notNull(),
  type: varchar('type', { length: 100 }),
  status: varchar('status', { length: 50 }).default('PLANNED'),
  startDate: date('start_date'),
  endDate: date('end_date'),
  budgetedCost: numeric('budgeted_cost', { precision: 15, scale: 2 }).default('0'),
  actualCost: numeric('actual_cost', { precision: 15, scale: 2 }).default('0'),
  expectedRevenue: numeric('expected_revenue', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const campaignMembers = pgTable('campaign_members', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  campaignId: uuid('campaign_id').notNull().references(() => campaigns.id, { onDelete: 'cascade' }),
  contactId: uuid('contact_id').notNull().references(() => contacts.id, { onDelete: 'cascade' }),
  status: varchar('status', { length: 50 }).default('SENT'),
  respondedAt: timestamp('responded_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const dealLineItems = pgTable('deal_line_items', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  dealId: uuid('deal_id').notNull().references(() => deals.id, { onDelete: 'cascade' }),
  productId: uuid('product_id').notNull(),
  productName: varchar('product_name', { length: 255 }).notNull(),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).default('1'),
  unitPrice: numeric('unit_price', { precision: 15, scale: 2 }).notNull(),
  discountPercent: numeric('discount_percent', { precision: 5, scale: 2 }).default('0'),
  totalPrice: numeric('total_price', { precision: 15, scale: 2 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const quotes = pgTable('quotes', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  quoteNumber: varchar('quote_number', { length: 100 }).notNull(),
  status: varchar('status', { length: 50 }).default('DRAFT'),
  validUntil: date('valid_until').notNull(),
  termsAndConditions: text('terms_and_conditions'),
  subtotal: numeric('subtotal', { precision: 15, scale: 2 }).default('0'),
  taxTotal: numeric('tax_total', { precision: 15, scale: 2 }).default('0'),
  grandTotal: numeric('grand_total', { precision: 15, scale: 2 }).default('0'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
})

export const emails = pgTable('emails', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  direction: varchar('direction', { length: 20 }),
  fromAddress: varchar('from_address', { length: 255 }).notNull(),
  toAddress: varchar('to_address', { length: 255 }).notNull(),
  subject: varchar('subject', { length: 500 }),
  bodyText: text('body_text'),
  bodyHtml: text('body_html'),
  messageId: varchar('message_id', { length: 255 }),
  status: varchar('status', { length: 50 }).default('SENT'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
})

export const whatsappMessages = pgTable('whatsapp_messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  direction: varchar('direction', { length: 20 }),
  phoneNumber: varchar('phone_number', { length: 50 }).notNull(),
  messageBody: text('message_body').notNull(),
  templateUsed: varchar('template_used', { length: 100 }),
  status: varchar('status', { length: 50 }).default('DELIVERED'),
  sentAt: timestamp('sent_at', { withTimezone: true }).defaultNow(),
})

export const meetings = pgTable('meetings', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  contactId: uuid('contact_id').references(() => contacts.id, { onDelete: 'cascade' }),
  dealId: uuid('deal_id').references(() => deals.id, { onDelete: 'cascade' }),
  title: varchar('title', { length: 255 }).notNull(),
  location: varchar('location', { length: 255 }),
  startTime: timestamp('start_time', { withTimezone: true }).notNull(),
  endTime: timestamp('end_time', { withTimezone: true }).notNull(),
  status: varchar('status', { length: 50 }).default('SCHEDULED'),
  organizerUserId: uuid('organizer_user_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const documentLinks = pgTable('document_links', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  mediaId: uuid('media_id').notNull(),
  linkedEntityType: varchar('linked_entity_type', { length: 50 }).notNull(),
  linkedEntityId: uuid('linked_entity_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const ticketReplies = pgTable('ticket_replies', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  ticketId: uuid('ticket_id').notNull(),
  authorType: varchar('author_type', { length: 50 }).notNull(),
  authorId: uuid('author_id').notNull(),
  message: text('message').notNull(),
  isInternalNote: boolean('is_internal_note').default(false),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const fieldHistoryLogs = pgTable('field_history_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  entityType: varchar('entity_type', { length: 50 }).notNull(),
  entityId: uuid('entity_id').notNull(),
  fieldName: varchar('field_name', { length: 100 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  changedByUserId: uuid('changed_by_user_id').notNull(),
  changedAt: timestamp('changed_at', { withTimezone: true }).defaultNow().notNull(),
})
