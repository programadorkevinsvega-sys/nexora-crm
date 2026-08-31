import { z } from 'zod'

export const MetaLeadFormSchema = z.object({
  formId: z.string(),
  formName: z.string(),
  status: z.string().default('ACTIVE'),
  leadsCount: z.number().default(0),
  defaultLeadStatus: z.string().default('NEW'),
})
export type MetaLeadForm = z.infer<typeof MetaLeadFormSchema>

export const MetaIntegrationSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  status: z.enum(['CONNECTED', 'DISCONNECTED', 'ERROR', 'EXPIRED']),
  metaAppId: z.string().nullable().optional(),
  metaUserId: z.string().nullable().optional(),
  metaUserName: z.string().nullable().optional(),
  selectedPageId: z.string().nullable().optional(),
  selectedPageName: z.string().nullable().optional(),
  adAccountId: z.string().nullable().optional(),
  adAccountName: z.string().nullable().optional(),
  leadGenForms: z.array(MetaLeadFormSchema).default([]),
  autoCreateDeal: z.boolean().default(true),
  targetPipelineId: z.string().uuid().nullable().optional(),
  targetStageId: z.string().uuid().nullable().optional(),
  lastSyncAt: z.any().nullable().optional(),
  createdAt: z.any(),
  updatedAt: z.any(),
})
export type MetaIntegration = z.infer<typeof MetaIntegrationSchema>

export const MetaLeadAdLogSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  leadgenId: z.string(),
  formId: z.string().nullable().optional(),
  formName: z.string().nullable().optional(),
  adId: z.string().nullable().optional(),
  adName: z.string().nullable().optional(),
  campaignName: z.string().nullable().optional(),
  contactId: z.string().uuid().nullable().optional(),
  dealId: z.string().uuid().nullable().optional(),
  leadData: z.record(z.any()),
  status: z.string(),
  errorMessage: z.string().nullable().optional(),
  receivedAt: z.any(),
})
export type MetaLeadAdLog = z.infer<typeof MetaLeadAdLogSchema>

export const MetaConfigUpdateSchema = z.object({
  selectedPageId: z.string().optional(),
  selectedPageName: z.string().optional(),
  adAccountId: z.string().optional(),
  adAccountName: z.string().optional(),
  autoCreateDeal: z.boolean().optional(),
  targetPipelineId: z.string().uuid().nullable().optional(),
  targetStageId: z.string().uuid().nullable().optional(),
})
export type MetaConfigUpdate = z.infer<typeof MetaConfigUpdateSchema>

export const SimulateMetaLeadSchema = z.object({
  formName: z.string().default('Formulario Clientes Potenciales - Facebook Ads'),
  campaignName: z.string().default('Campaña LATAM Q3 — Expansión B2B'),
  adName: z.string().default('Anuncio Video Reel 01'),
  fullName: z.string(),
  email: z.string().email(),
  phone: z.string().optional(),
  companyName: z.string().optional(),
  jobTitle: z.string().optional(),
})
export type SimulateMetaLead = z.infer<typeof SimulateMetaLeadSchema>
