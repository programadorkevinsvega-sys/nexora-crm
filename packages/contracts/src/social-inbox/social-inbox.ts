import { z } from 'zod'

export const SOCIAL_PLATFORMS = ['FACEBOOK', 'INSTAGRAM', 'TIKTOK'] as const
export type SocialPlatform = typeof SOCIAL_PLATFORMS[number]

export const SOCIAL_POST_TYPES = ['PAGE_POST', 'AD_CREATIVE', 'REEL', 'TIKTOK_VIDEO'] as const
export type SocialPostType = typeof SOCIAL_POST_TYPES[number]

export const SocialCommentSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  platform: z.enum(SOCIAL_PLATFORMS),
  postType: z.enum(SOCIAL_POST_TYPES),
  postId: z.string(),
  postTitle: z.string().optional(),
  authorId: z.string(),
  authorName: z.string(),
  authorAvatarUrl: z.string().url().optional(),
  commentId: z.string(),
  parentCommentId: z.string().optional(),
  message: z.string(),
  sentiment: z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE', 'QUESTION']).default('NEUTRAL'),
  status: z.enum(['PENDING', 'REPLIED', 'BOT_REPLIED', 'HIDDEN', 'IGNORED']).default('PENDING'),
  replyMessage: z.string().optional(),
  repliedAt: z.string().datetime().optional(),
  repliedBy: z.enum(['AI_BOT', 'AUTO_RULE', 'AGENT']).optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SocialComment = z.infer<typeof SocialCommentSchema>

export const SocialAutoResponderRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  platform: z.enum(['ALL', 'FACEBOOK', 'INSTAGRAM', 'TIKTOK']).default('ALL'),
  triggerKeywords: z.array(z.string()).default([]),
  responseMode: z.enum(['STATIC_TEMPLATE', 'AI_BOT']).default('STATIC_TEMPLATE'),
  staticReplies: z.array(z.string()).default([]),
  aiPrompt: z.string().optional(),
  sendPrivateDm: z.boolean().default(false),
  autoCreateLead: z.boolean().default(true),
  pipelineId: z.string().optional(),
  stageId: z.string().optional(),
  isEnabled: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type SocialAutoResponderRule = z.infer<typeof SocialAutoResponderRuleSchema>

export const CreateSocialReplyDtoSchema = z.object({
  commentId: z.string(),
  replyMessage: z.string().min(1),
  authorUserId: z.string().optional(),
})
export type CreateSocialReplyDto = z.infer<typeof CreateSocialReplyDtoSchema>

export const SimulateCommentDtoSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORMS),
  postType: z.enum(SOCIAL_POST_TYPES),
  postTitle: z.string(),
  authorName: z.string(),
  message: z.string(),
})
export type SimulateCommentDto = z.infer<typeof SimulateCommentDtoSchema>
