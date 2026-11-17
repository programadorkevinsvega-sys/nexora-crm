import { z } from 'zod'

export const EmailValidationResultSchema = z.object({
  email: z.string().email(),
  isValid: z.boolean(),
  deliverabilityScore: z.number().int().min(0).max(100),
  isDisposable: z.boolean(),
  isFreeMail: z.boolean(),
  hasMxRecords: z.boolean(),
  domain: z.string(),
  reason: z.string(),
})
export type EmailValidationResult = z.infer<typeof EmailValidationResultSchema>

export const ContactEnrichmentResultSchema = z.object({
  contactId: z.string().uuid(),
  linkedinProfileUrl: z.string().optional(),
  headline: z.string().optional(),
  jobTitle: z.string().optional(),
  companyName: z.string().optional(),
  seniority: z.string().optional(),
  industry: z.string().optional(),
  location: z.string().optional(),
  skills: z.array(z.string()).default([]),
  emailValidation: EmailValidationResultSchema.optional(),
  enrichedAt: z.string(),
})
export type ContactEnrichmentResult = z.infer<typeof ContactEnrichmentResultSchema>

export const CompanyEnrichmentResultSchema = z.object({
  companyId: z.string().uuid(),
  linkedinCompanyUrl: z.string().optional(),
  domain: z.string().optional(),
  industry: z.string().optional(),
  headcount: z.string().optional(),
  foundedYear: z.number().optional(),
  headquarters: z.string().optional(),
  technologies: z.array(z.string()).default([]),
  enrichedAt: z.string(),
})
export type CompanyEnrichmentResult = z.infer<typeof CompanyEnrichmentResultSchema>
