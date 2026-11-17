import { pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index } from 'drizzle-orm/pg-core'

export const securityAccessLogs = pgTable(
  'security_access_logs',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id'),
    ipAddress: varchar('ip_address', { length: 100 }).notNull(),
    userAgent: text('user_agent'),
    country: varchar('country', { length: 100 }).default('Colombia'),
    city: varchar('city', { length: 100 }).default('Bogotá'),
    loginStatus: varchar('login_status', { length: 30 }).default('SUCCESS').notNull(), // 'SUCCESS' | 'FAILED' | 'BLOCKED'
    failureReason: varchar('failure_reason', { length: 255 }),
    isSuspicious: boolean('is_suspicious').default(false).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sec_logs_tenant_idx').on(table.tenantId),
    userIdx: index('sec_logs_user_idx').on(table.tenantId, table.userId),
    statusIdx: index('sec_logs_status_idx').on(table.tenantId, table.loginStatus),
  }),
)

export const securityAnomalies = pgTable(
  'security_anomalies',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    userId: uuid('user_id'),
    anomalyType: varchar('anomaly_type', { length: 100 }).default('IMPOSSIBLE_TRAVEL').notNull(), // 'IMPOSSIBLE_TRAVEL' | 'BRUTE_FORCE' | 'NEW_COUNTRY' | 'SUSPICIOUS_USER_AGENT'
    severity: varchar('severity', { length: 30 }).default('HIGH').notNull(), // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
    description: text('description').notNull(),
    details: jsonb('details').default({}).notNull(),
    isResolved: boolean('is_resolved').default(false).notNull(),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('sec_anom_tenant_idx').on(table.tenantId),
    sevIdx: index('sec_anom_sev_idx').on(table.tenantId, table.severity),
  }),
)
