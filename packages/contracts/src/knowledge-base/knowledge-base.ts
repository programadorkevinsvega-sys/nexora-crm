import { z } from 'zod'

export const KnowledgeBaseCategorySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  slug: z.string().min(1),
  description: z.string().nullable().optional(),
  icon: z.string().default('book-open'),
  sortOrder: z.number().int().default(0),
  isPublic: z.boolean().default(true),
  articlesCount: z.number().int().default(0),
})
export type KnowledgeBaseCategory = z.infer<typeof KnowledgeBaseCategorySchema>

export const CreateKnowledgeBaseCategorySchema = z.object({
  name: z.string().min(1),
  slug: z.string().optional(),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.number().int().optional(),
  isPublic: z.boolean().optional(),
})
export type CreateKnowledgeBaseCategory = z.infer<typeof CreateKnowledgeBaseCategorySchema>

export const KnowledgeBaseArticleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  categoryId: z.string().uuid().nullable().optional(),
  categoryName: z.string().nullable().optional(),
  title: z.string().min(1),
  slug: z.string().min(1),
  summary: z.string().nullable().optional(),
  contentMarkdown: z.string().min(1),
  isPublished: z.boolean().default(true),
  viewCount: z.number().int().default(0),
  helpfulVotes: z.number().int().default(0),
  unhelpfulVotes: z.number().int().default(0),
  tags: z.array(z.string()).default([]),
  authorName: z.string().default('Equipo de Soporte'),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type KnowledgeBaseArticle = z.infer<typeof KnowledgeBaseArticleSchema>

export const CreateKnowledgeBaseArticleSchema = z.object({
  categoryId: z.string().uuid().optional(),
  title: z.string().min(1),
  slug: z.string().optional(),
  summary: z.string().optional(),
  contentMarkdown: z.string().min(1),
  isPublished: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
  authorName: z.string().optional(),
})
export type CreateKnowledgeBaseArticle = z.infer<typeof CreateKnowledgeBaseArticleSchema>

export const VoteArticleSchema = z.object({
  articleId: z.string().uuid(),
  isHelpful: z.boolean(),
})
export type VoteArticle = z.infer<typeof VoteArticleSchema>
