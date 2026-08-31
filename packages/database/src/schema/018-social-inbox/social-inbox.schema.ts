import {
  pgTable, uuid, varchar, text, timestamp, boolean, jsonb, index,
} from 'drizzle-orm/pg-core'

export const socialComments = pgTable(
  'social_comments',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    platform: varchar('platform', { length: 20 }).notNull(), // FACEBOOK | INSTAGRAM | TIKTOK
    postType: varchar('post_type', { length: 30 }).notNull(),
    postId: varchar('post_id', { length: 255 }).notNull(),
    postTitle: text('post_title'),
    authorId: varchar('author_id', { length: 255 }).notNull(),
    authorName: varchar('author_name', { length: 255 }).notNull(),
    authorAvatarUrl: text('author_avatar_url'),
    commentId: varchar('comment_id', { length: 255 }).notNull(),
    parentCommentId: varchar('parent_comment_id', { length: 255 }),
    message: text('message').notNull(),
    sentiment: varchar('sentiment', { length: 20 }).default('NEUTRAL').notNull(),
    status: varchar('status', { length: 30 }).default('PENDING').notNull(),
    replyMessage: text('reply_message'),
    repliedAt: timestamp('replied_at', { withTimezone: true }),
    repliedBy: varchar('replied_by', { length: 20 }),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('social_comments_tenant_idx').on(table.tenantId),
    platformIdx: index('social_comments_platform_idx').on(table.tenantId, table.platform),
    statusIdx: index('social_comments_status_idx').on(table.tenantId, table.status),
    commentIdIdx: index('social_comments_comment_id_idx').on(table.commentId),
  }),
)

export const socialAutoResponderRules = pgTable(
  'social_auto_responder_rules',
  {
    id: uuid('id').defaultRandom().primaryKey(),
    tenantId: uuid('tenant_id').notNull(),
    name: varchar('name', { length: 255 }).notNull(),
    platform: varchar('platform', { length: 20 }).default('ALL').notNull(),
    triggerKeywords: jsonb('trigger_keywords').default([]).notNull(),
    responseMode: varchar('response_mode', { length: 30 }).default('STATIC_TEMPLATE').notNull(),
    staticReplies: jsonb('static_replies').default([]).notNull(),
    aiPrompt: text('ai_prompt'),
    sendPrivateDm: boolean('send_private_dm').default(false).notNull(),
    autoCreateLead: boolean('auto_create_lead').default(true).notNull(),
    pipelineId: uuid('pipeline_id'),
    stageId: uuid('stage_id'),
    // RAG Scoping: empty = all posts / all categories
    targetPostIds: jsonb('target_post_ids').default([]).notNull(),
    knowledgeCategoryIds: jsonb('knowledge_category_ids').default([]).notNull(),
    isEnabled: boolean('is_enabled').default(true).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => ({
    tenantIdx: index('social_rules_tenant_idx').on(table.tenantId),
    platformIdx: index('social_rules_platform_idx').on(table.tenantId, table.platform),
  }),
)
