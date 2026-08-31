import { z } from 'zod'

export const CampaignMemberSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  campaignId: z.string().uuid(),
  contactId: z.string().uuid(),
  status: z.enum(['SENT', 'OPENED', 'CLICKED', 'RESPONDED', 'BOUNCED', 'UNSUBSCRIBED']).default('SENT'),
  respondedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
})
export type CampaignMember = z.infer<typeof CampaignMemberSchema>

export const AddCampaignMemberSchema = z.object({
  contactId: z.string().uuid(),
})
export type AddCampaignMember = z.infer<typeof AddCampaignMemberSchema>
