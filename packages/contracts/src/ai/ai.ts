import { z } from 'zod'

export const DealHealthSchema = z.enum(['EXCELLENT', 'GOOD', 'WARNING', 'CRITICAL'])
export type DealHealth = z.infer<typeof DealHealthSchema>

export const DealWinProbabilitySchema = z.object({
  dealId: z.string().uuid(),
  dealName: z.string(),
  dealAmount: z.number(),
  winProbabilityPercent: z.number().int().min(0).max(100),
  dealHealth: DealHealthSchema,
  positiveFactors: z.array(z.string()),
  riskFactors: z.array(z.string()),
  recommendedNextActions: z.array(z.string()),
  predictedCloseDate: z.string(),
  calculatedAt: z.string(),
})
export type DealWinProbability = z.infer<typeof DealWinProbabilitySchema>

export const MessageChannelSchema = z.enum(['EMAIL', 'WHATSAPP', 'NOTE'])
export type MessageChannel = z.infer<typeof MessageChannelSchema>

export const MessageToneSchema = z.enum(['FORMAL', 'FRIENDLY', 'PERSUASIVE', 'URGENT'])
export type MessageTone = z.infer<typeof MessageToneSchema>

export const MessageObjectiveSchema = z.enum([
  'FOLLOW_UP',
  'PROPOSAL_INTRODUCTION',
  'CONTRACT_SIGNING',
  'PAYMENT_REMINDER',
  'RE_ENGAGEMENT',
])
export type MessageObjective = z.infer<typeof MessageObjectiveSchema>

export const GenerateMessageDraftSchema = z.object({
  contactId: z.string().uuid().optional(),
  dealId: z.string().uuid().optional(),
  channel: MessageChannelSchema.default('EMAIL'),
  tone: MessageToneSchema.default('FORMAL'),
  objective: MessageObjectiveSchema.default('FOLLOW_UP'),
  customInstructions: z.string().optional(),
})
export type GenerateMessageDraft = z.infer<typeof GenerateMessageDraftSchema>

export const GeneratedMessageDraftSchema = z.object({
  subject: z.string().nullable().optional(),
  bodyText: z.string(),
  channel: MessageChannelSchema,
  tone: MessageToneSchema,
  objective: MessageObjectiveSchema,
  tokensEstimated: z.number().int(),
})
export type GeneratedMessageDraft = z.infer<typeof GeneratedMessageDraftSchema>

export const SentimentSchema = z.enum(['POSITIVE', 'NEUTRAL', 'NEGATIVE'])
export type Sentiment = z.infer<typeof SentimentSchema>

export const ContactExecutiveSummarySchema = z.object({
  contactId: z.string().uuid(),
  contactName: z.string(),
  summary: z.string(),
  sentiment: SentimentSchema,
  keyPainPoints: z.array(z.string()),
  recommendedStrategy: z.string(),
  generatedAt: z.string(),
})
export type ContactExecutiveSummary = z.infer<typeof ContactExecutiveSummarySchema>

export const ChurnRiskLevelSchema = z.enum(['LOW', 'MEDIUM', 'HIGH'])
export type ChurnRiskLevel = z.infer<typeof ChurnRiskLevelSchema>

export const ChurnRiskPredictionSchema = z.object({
  contactId: z.string().uuid(),
  contactName: z.string(),
  churnRiskPercent: z.number().int().min(0).max(100),
  churnRiskLevel: ChurnRiskLevelSchema,
  riskIndicators: z.array(z.string()),
  preventiveActions: z.array(z.string()),
  calculatedAt: z.string(),
})
export type ChurnRiskPrediction = z.infer<typeof ChurnRiskPredictionSchema>
