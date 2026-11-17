import { z } from 'zod'

export const AuditAction = z.enum(['CREATE', 'UPDATE', 'DELETE', 'RESTORE', 'LOGIN', 'LOGOUT', 'EXPORT', 'IMPORT', 'ARCHIVE', 'VIEW', 'OTHER'])

export const ListAuditLogsSchema = z.object({
  tenantId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  action: AuditAction.optional(),
  moduleName: z.string().max(100).optional(),
  userId: z.string().uuid().optional(),
  fromDate: z.string().datetime().optional(),
  toDate: z.string().datetime().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})
export type ListAuditLogs = z.infer<typeof ListAuditLogsSchema>

export const CreateAuditLogSchema = z.object({
  tenantId: z.string().uuid().optional(),
  entityType: z.string().min(1).max(100),
  entityId: z.string().uuid(),
  action: AuditAction,
  fieldName: z.string().max(100).optional(),
  oldValue: z.string().optional(),
  newValue: z.string().optional(),
  changedByUserId: z.string().uuid().optional(),
  moduleName: z.string().max(100).optional(),
  correlationId: z.string().max(255).optional(),
  ipAddress: z.string().max(45).optional(),
  userAgent: z.string().optional(),
  metadataJson: z.record(z.unknown()).optional(),
})
export type CreateAuditLog = z.infer<typeof CreateAuditLogSchema>
