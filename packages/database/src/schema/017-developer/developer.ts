import {
  pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, uniqueIndex,
} from 'drizzle-orm/pg-core'

// ─────────────────────────────────────────────────────────────
// FASE 4: Public Developer API — DB Schema
// Tables: api_keys, webhook_endpoints, webhook_delivery_logs
// ─────────────────────────────────────────────────────────────

export const apiKeys = pgTable(
  'api_keys',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    // Stored as SHA-256 hash. The raw key nex_live_<random> shown only on creation.
    keyHash: varchar('key_hash', { length: 64 }).notNull(),
    // Prefix for display (e.g. "nex_live_xxxx...") — last 8 chars of raw key
    keyPrefix: varchar('key_prefix', { length: 20 }).notNull(),
    // Scopes: contacts:read, contacts:write, deals:read, deals:write,
    //         tickets:read, tickets:write, quotes:read, webhooks:manage
    scopes: jsonb('scopes').default([]).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    lastUsedAt: timestamp('last_used_at', { withTimezone: true }),
    expiresAt: timestamp('expires_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('api_keys_tenant_idx').on(table.tenantId),
    keyHashIdx: uniqueIndex('api_keys_key_hash_idx').on(table.keyHash),
  }),
)

export const webhookEndpoints = pgTable(
  'webhook_endpoints',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    url: text('url').notNull(),
    // HMAC-SHA256 secret stored as plain text (tenant manages rotation)
    secret: varchar('secret', { length: 255 }).notNull(),
    // Events: contact.created, deal.stage_changed, deal.won, quote.accepted,
    //         contract.signed, ticket.created, payment.received
    events: jsonb('events').default([]).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('webhook_endpoints_tenant_idx').on(table.tenantId),
  }),
)

export const webhookDeliveryLogs = pgTable(
  'webhook_delivery_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    endpointId: uuid('endpoint_id').notNull().references(() => webhookEndpoints.id, { onDelete: 'cascade' }),
    event: varchar('event', { length: 100 }).notNull(),
    payload: jsonb('payload').notNull(),
    // HTTP status from the target (null = not yet delivered or failed)
    responseStatus: integer('response_status'),
    responseBody: text('response_body'),
    // Delivery duration in ms
    durationMs: integer('duration_ms'),
    attempt: integer('attempt').default(1).notNull(),
    status: varchar('status', { length: 30 }).default('PENDING').notNull(), // PENDING, SUCCESS, FAILED, RETRYING
    deliveredAt: timestamp('delivered_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('webhook_delivery_logs_tenant_idx').on(table.tenantId),
    endpointIdx: index('webhook_delivery_logs_endpoint_idx').on(table.endpointId),
    statusIdx: index('webhook_delivery_logs_status_idx').on(table.status),
  }),
)
