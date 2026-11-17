import { pgTable, uuid, varchar, integer, timestamp, boolean, jsonb } from 'drizzle-orm/pg-core'

export const pipelines = pgTable('pipelines', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  name: varchar('name', { length: 100 }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})

export const pipelineStages = pgTable('pipeline_stages', {
  id: uuid('id').defaultRandom().primaryKey(),
  tenantId: uuid('tenant_id').notNull(),
  pipelineId: uuid('pipeline_id').notNull().references(() => pipelines.id, { onDelete: 'cascade' }),
  name: varchar('name', { length: 100 }).notNull(),
  probabilityPercent: integer('probability_percent').default(0),
  displayOrder: integer('display_order').notNull(),
  isWonStage: boolean('is_won_stage').default(false).notNull(),
  isLostStage: boolean('is_lost_stage').default(false).notNull(),
  autoActions: jsonb('auto_actions').default([]).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
})
