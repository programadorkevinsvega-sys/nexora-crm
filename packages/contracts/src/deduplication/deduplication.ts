import { z } from 'zod'

export const DeduplicationEntityTypeSchema = z.enum(['CONTACT', 'COMPANY'])
export type DeduplicationEntityType = z.infer<typeof DeduplicationEntityTypeSchema>

export const MatchTypeSchema = z.enum(['EXACT', 'FUZZY_LEVENSHTEIN', 'PHONE_NORMALIZED'])
export type MatchType = z.infer<typeof MatchTypeSchema>

export const DeduplicationRuleSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  entityType: DeduplicationEntityTypeSchema,
  matchFields: z.array(z.string()),
  matchType: MatchTypeSchema,
  similarityThreshold: z.number(),
  autoMergeEnabled: z.boolean(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type DeduplicationRule = z.infer<typeof DeduplicationRuleSchema>

export const CreateDeduplicationRuleDtoSchema = z.object({
  name: z.string().min(2),
  entityType: DeduplicationEntityTypeSchema.default('CONTACT'),
  matchFields: z.array(z.string()).min(1),
  matchType: MatchTypeSchema.default('EXACT'),
  similarityThreshold: z.number().min(50).max(100).default(85).optional(),
  autoMergeEnabled: z.boolean().default(false).optional(),
  isActive: z.boolean().default(true).optional(),
})
export type CreateDeduplicationRuleDto = z.infer<typeof CreateDeduplicationRuleDtoSchema>

export const DuplicateCandidateSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  email: z.string().optional(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  createdAt: z.string(),
})
export type DuplicateCandidate = z.infer<typeof DuplicateCandidateSchema>

export const DuplicateGroupSchema = z.object({
  matchField: z.string(),
  matchValue: z.string(),
  similarityScore: z.number(),
  records: z.array(DuplicateCandidateSchema),
})
export type DuplicateGroup = z.infer<typeof DuplicateGroupSchema>

export const MergeRecordsDtoSchema = z.object({
  entityType: DeduplicationEntityTypeSchema,
  masterRecordId: z.string().uuid(),
  duplicateRecordId: z.string().uuid(),
  matchedByField: z.string(),
})
export type MergeRecordsDto = z.infer<typeof MergeRecordsDtoSchema>

export const DeduplicationAuditLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  entityType: DeduplicationEntityTypeSchema,
  masterRecordId: z.string().uuid(),
  mergedRecordId: z.string().uuid(),
  matchedByField: z.string(),
  mergedDataSnapshot: z.record(z.any()),
  mergedByUserId: z.string().uuid().nullable().optional(),
  mergedAt: z.string(),
})
export type DeduplicationAuditLog = z.infer<typeof DeduplicationAuditLogSchema>
