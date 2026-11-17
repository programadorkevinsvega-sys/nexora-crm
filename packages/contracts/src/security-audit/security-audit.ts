import { z } from 'zod'

export const LoginStatusSchema = z.enum(['SUCCESS', 'FAILED', 'BLOCKED'])
export type LoginStatus = z.infer<typeof LoginStatusSchema>

export const AnomalyTypeSchema = z.enum(['IMPOSSIBLE_TRAVEL', 'BRUTE_FORCE', 'NEW_COUNTRY', 'SUSPICIOUS_USER_AGENT'])
export type AnomalyType = z.infer<typeof AnomalyTypeSchema>

export const SecuritySeveritySchema = z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
export type SecuritySeverity = z.infer<typeof SecuritySeveritySchema>

export const SecurityAccessLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  ipAddress: z.string(),
  userAgent: z.string().nullable().optional(),
  country: z.string().nullable().optional(),
  city: z.string().nullable().optional(),
  loginStatus: LoginStatusSchema,
  failureReason: z.string().nullable().optional(),
  isSuspicious: z.boolean(),
  createdAt: z.string(),
})
export type SecurityAccessLog = z.infer<typeof SecurityAccessLogSchema>

export const RecordAccessEventDtoSchema = z.object({
  userId: z.string().uuid().optional(),
  ipAddress: z.string().min(1),
  userAgent: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  loginStatus: LoginStatusSchema.default('SUCCESS'),
  failureReason: z.string().optional(),
})
export type RecordAccessEventDto = z.infer<typeof RecordAccessEventDtoSchema>

export const SecurityAnomalySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid().nullable().optional(),
  anomalyType: AnomalyTypeSchema,
  severity: SecuritySeveritySchema,
  description: z.string(),
  details: z.record(z.any()),
  isResolved: z.boolean(),
  resolvedAt: z.string().nullable().optional(),
  createdAt: z.string(),
})
export type SecurityAnomaly = z.infer<typeof SecurityAnomalySchema>

export const ResolveAnomalyDtoSchema = z.object({
  notes: z.string().optional(),
})
export type ResolveAnomalyDto = z.infer<typeof ResolveAnomalyDtoSchema>
