import { z } from 'zod'
import { KnowledgeBaseArticleSchema } from '../knowledge-base/knowledge-base'

export const CustomerPortalOverviewSchema = z.object({
  contactId: z.string().uuid(),
  contactName: z.string(),
  contactEmail: z.string().nullable().optional(),
  companyName: z.string().nullable().optional(),
  openTicketsCount: z.number().int().default(0),
  activeQuotesCount: z.number().int().default(0),
  activeContractsCount: z.number().int().default(0),
  featuredArticles: z.array(KnowledgeBaseArticleSchema).default([]),
})
export type CustomerPortalOverview = z.infer<typeof CustomerPortalOverviewSchema>

export const SubmitPortalTicketSchema = z.object({
  contactId: z.string().uuid(),
  subject: z.string().min(1),
  description: z.string().min(1),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).default('MEDIUM'),
})
export type SubmitPortalTicket = z.infer<typeof SubmitPortalTicketSchema>
