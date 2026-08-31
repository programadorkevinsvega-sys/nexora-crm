import { pgTable, uuid, varchar, text, timestamp, boolean, integer, jsonb, index, uniqueIndex } from 'drizzle-orm/pg-core'

export const knowledgeBaseCategories = pgTable(
  'knowledge_base_categories',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 100 }).notNull(),
    slug: varchar('slug', { length: 120 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }).default('book-open'),
    sortOrder: integer('sort_order').default(0).notNull(),
    isPublic: boolean('is_public').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('kb_categories_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantOrderIdx: index('kb_categories_tenant_order_idx').on(table.tenantId, table.sortOrder),
  }),
)

export const knowledgeBaseArticles = pgTable(
  'knowledge_base_articles',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    categoryId: uuid('category_id').references(() => knowledgeBaseCategories.id, { onDelete: 'set null' }),
    title: varchar('title', { length: 255 }).notNull(),
    slug: varchar('slug', { length: 255 }).notNull(),
    summary: text('summary'),
    contentMarkdown: text('content_markdown').notNull(),
    isPublished: boolean('is_published').default(true).notNull(),
    viewCount: integer('view_count').default(0).notNull(),
    helpfulVotes: integer('helpful_votes').default(0).notNull(),
    unhelpfulVotes: integer('unhelpful_votes').default(0).notNull(),
    tags: jsonb('tags').default([]).notNull(),
    authorName: varchar('author_name', { length: 150 }).default('Equipo de Soporte'),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantSlugIdx: uniqueIndex('kb_articles_tenant_slug_idx').on(table.tenantId, table.slug),
    tenantCategoryIdx: index('kb_articles_tenant_category_idx').on(table.tenantId, table.categoryId),
    tenantPublishedIdx: index('kb_articles_tenant_published_idx').on(table.tenantId, table.isPublished),
  }),
)
