import { z } from 'zod'

export const BiReportCategorySchema = z.enum(['SALES', 'MARKETING', 'SUPPORT', 'FINANCE', 'EXECUTIVE'])
export type BiReportCategory = z.infer<typeof BiReportCategorySchema>

export const BiEmbedTypeSchema = z.enum(['POWER_BI_EMBED', 'POWER_BI_WEB', 'CUSTOM_IFRAME'])
export type BiEmbedType = z.infer<typeof BiEmbedTypeSchema>

export const BiReportSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  title: z.string().min(1),
  description: z.string().nullable().optional(),
  category: BiReportCategorySchema,
  embedType: BiEmbedTypeSchema,
  embedUrl: z.string().url(),
  reportId: z.string().nullable().optional(),
  workspaceId: z.string().nullable().optional(),
  refreshSchedule: z.string(),
  isDefault: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
})
export type BiReport = z.infer<typeof BiReportSchema>

export const CreateBiReportDtoSchema = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  category: BiReportCategorySchema.default('EXECUTIVE'),
  embedType: BiEmbedTypeSchema.default('POWER_BI_WEB'),
  embedUrl: z.string().url(),
  reportId: z.string().optional(),
  workspaceId: z.string().optional(),
  refreshSchedule: z.string().default('HOURLY'),
  isDefault: z.boolean().default(false).optional(),
})
export type CreateBiReportDto = z.infer<typeof CreateBiReportDtoSchema>
