import { pgTable, uuid, varchar, timestamp, boolean, integer, jsonb, index } from 'drizzle-orm/pg-core'

export const deduplicationRules = pgTable(
  'deduplication_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    entityType: varchar('entity_type', { length: 50 }).default('CONTACT').notNull(), // 'CONTACT' | 'COMPANY'
    matchFields: jsonb('match_fields').default(['email']).notNull(),
    matchType: varchar('match_type', { length: 50 }).default('EXACT').notNull(), // 'EXACT' | 'FUZZY_LEVENSHTEIN' | 'PHONE_NORMALIZED'
    similarityThreshold: integer('similarity_threshold').default(85).notNull(), // 0 to 100%
    autoMergeEnabled: boolean('auto_merge_enabled').default(false).notNull(),
    isActive: boolean('is_active').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('dedup_rules_tenant_idx').on(table.tenantId),
    entityIdx: index('dedup_rules_entity_idx').on(table.tenantId, table.entityType),
  }),
)

export const deduplicationAuditLogs = pgTable(
  'deduplication_audit_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    entityType: varchar('entity_type', { length: 50 }).notNull(),
    masterRecordId: uuid('master_record_id').notNull(),
    mergedRecordId: uuid('merged_record_id').notNull(),
    matchedByField: varchar('matched_by_field', { length: 100 }).notNull(),
    mergedDataSnapshot: jsonb('merged_data_snapshot').default({}).notNull(),
    mergedByUserId: uuid('merged_by_user_id'),
    mergedAt: timestamp('merged_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('dedup_audit_tenant_idx').on(table.tenantId),
    masterIdx: index('dedup_audit_master_idx').on(table.tenantId, table.masterRecordId),
  }),
)
