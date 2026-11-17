import { z } from 'zod'

export const UploadFileSchema = z.object({
  tenantId: z.string().uuid().optional(),
  fileName: z.string().min(1).max(500),
  mimeType: z.string().min(1).max(127),
  uploadedByUserId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
})
export type UploadFile = z.infer<typeof UploadFileSchema>

export const ListFilesSchema = z.object({
  tenantId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  mimeType: z.string().max(127).optional(),
  uploadedByUserId: z.string().uuid().optional(),
  cursor: z.string().optional(),
  limit: z.number().int().min(1).max(100).optional(),
})
export type ListFiles = z.infer<typeof ListFilesSchema>

export const UpdateFileMetadataSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid().optional(),
  entityType: z.string().max(100).optional(),
  entityId: z.string().uuid().optional(),
  metadata: z.record(z.unknown()).optional(),
  isPublic: z.boolean().optional(),
})
export type UpdateFileMetadata = z.infer<typeof UpdateFileMetadataSchema>
