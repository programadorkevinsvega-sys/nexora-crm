import { z } from 'zod'

export const SurveyTypeSchema = z.enum(['NPS', 'CSAT', 'CES'])
export type SurveyType = z.infer<typeof SurveyTypeSchema>

export const SurveyTriggerEventSchema = z.enum(['DEAL_WON', 'TICKET_RESOLVED', 'MANUAL'])
export type SurveyTriggerEvent = z.infer<typeof SurveyTriggerEventSchema>

export const SurveyResponseCategorySchema = z.enum([
  'PROMOTER',
  'PASSIVE',
  'DETRACTOR',
  'SATISFIED',
  'NEUTRAL',
  'DISSATISFIED',
])
export type SurveyResponseCategory = z.infer<typeof SurveyResponseCategorySchema>

export const CustomerSurveySchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  name: z.string().min(1),
  type: SurveyTypeSchema,
  triggerEvent: SurveyTriggerEventSchema,
  questionText: z.string(),
  isActive: z.boolean(),
  createdAt: z.string(),
})
export type CustomerSurvey = z.infer<typeof CustomerSurveySchema>

export const CreateCustomerSurveyDtoSchema = z.object({
  name: z.string().min(2),
  type: SurveyTypeSchema.default('NPS'),
  triggerEvent: SurveyTriggerEventSchema.default('TICKET_RESOLVED'),
  questionText: z.string().min(5),
  isActive: z.boolean().default(true).optional(),
})
export type CreateCustomerSurveyDto = z.infer<typeof CreateCustomerSurveyDtoSchema>

export const SurveyResponseSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  surveyId: z.string().uuid(),
  contactId: z.string().uuid().nullable().optional(),
  score: z.number(),
  category: SurveyResponseCategorySchema,
  feedbackText: z.string().nullable().optional(),
  submittedAt: z.string(),
})
export type SurveyResponse = z.infer<typeof SurveyResponseSchema>

export const RecordSurveyResponseDtoSchema = z.object({
  surveyId: z.string().uuid(),
  contactId: z.string().uuid().optional(),
  score: z.number().min(0).max(10),
  feedbackText: z.string().optional(),
})
export type RecordSurveyResponseDto = z.infer<typeof RecordSurveyResponseDtoSchema>

export const SurveyAnalyticsSummarySchema = z.object({
  npsScore: z.number(), // -100 to +100
  csatAverage: z.number(), // 1.0 to 5.0
  totalResponses: z.number(),
  promotersPct: z.number(),
  passivesPct: z.number(),
  detractorsPct: z.number(),
})
export type SurveyAnalyticsSummary = z.infer<typeof SurveyAnalyticsSummarySchema>
