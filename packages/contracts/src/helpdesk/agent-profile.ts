import { z } from 'zod'

export const AgentProfileSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  userId: z.string().uuid(),
  isAvailable: z.boolean().default(true),
  agentStatus: z.string().max(50).default('ONLINE'),
  activeTicketsCount: z.number().int().default(0),
  resolvedTicketsCount: z.number().int().default(0),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
})
export type AgentProfile = z.infer<typeof AgentProfileSchema>

export const UpdateAgentAvailabilitySchema = z.object({
  isAvailable: z.boolean(),
  agentStatus: z.string().max(50).optional(),
})
export type UpdateAgentAvailability = z.infer<typeof UpdateAgentAvailabilitySchema>
