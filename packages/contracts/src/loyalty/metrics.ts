import { z } from 'zod'

export const CustomerMetricsSchema = z.object({
  id: z.string().uuid(),
  tenantId: z.string().uuid(),
  contactId: z.string().uuid(),
  churnRiskScore: z.number().min(0).max(100).nullable(),
  rfmScore: z.string().max(10).nullable(),
  npsScore: z.number().int().min(-100).max(100).nullable(),
  customerSatisfactionScore: z.number().min(0).max(10).nullable(),
  calculatedAt: z.string().datetime().nullable(),
})
export type CustomerMetrics = z.infer<typeof CustomerMetricsSchema>
