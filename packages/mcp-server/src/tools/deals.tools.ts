import { z } from 'zod'
import { NexoraClient } from '../client/nexora-client'

export function registerDealsTools(client: NexoraClient) {
  return [
    {
      name: 'nexora_list_deals',
      description: 'List commercial deals from the CRM pipeline with optional status or pipeline filters.',
      inputSchema: z.object({
        pipelineId: z.string().uuid().optional().describe('Filter deals by pipeline UUID'),
        status: z.enum(['OPEN', 'WON', 'LOST']).optional().describe('Filter by deal status'),
        limit: z.number().min(1).max(100).optional().describe('Limit number of deals returned'),
      }),
      handler: async (args: { pipelineId?: string; status?: string; limit?: number }) => {
        const queryParams = new URLSearchParams()
        if (args.pipelineId) queryParams.set('pipelineId', args.pipelineId)
        if (args.status) queryParams.set('status', args.status)
        if (args.limit) queryParams.set('limit', String(args.limit))
        const res = await client.get(`/api/v1/deals?${queryParams.toString()}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_get_deal',
      description: 'Get details of a specific deal by its UUID.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Deal UUID'),
      }),
      handler: async (args: { id: string }) => {
        const res = await client.get(`/api/v1/deals/${args.id}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_create_deal',
      description: 'Create a new deal opportunity in a sales pipeline.',
      inputSchema: z.object({
        name: z.string().min(1).describe('Deal name (e.g. Acme Corp Enterprise License)'),
        amount: z.number().min(0).describe('Deal value amount'),
        pipelineId: z.string().uuid().describe('Pipeline UUID'),
        stageId: z.string().uuid().describe('Initial Stage UUID'),
        contactId: z.string().uuid().optional().describe('Primary contact UUID'),
        companyId: z.string().uuid().optional().describe('Company UUID'),
        expectedCloseDate: z.string().optional().describe('Expected close date (YYYY-MM-DD)'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/deals', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_move_deal_stage',
      description: 'Move a deal to a different stage in the pipeline board.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Deal UUID'),
        stageId: z.string().uuid().describe('Destination stage UUID'),
      }),
      handler: async (args: { id: string; stageId: string }) => {
        const res = await client.post(`/api/v1/deals/${args.id}/stage`, { stageId: args.stageId })
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_win_deal',
      description: 'Mark a deal opportunity as WON (closed won).',
      inputSchema: z.object({
        id: z.string().uuid().describe('Deal UUID'),
        amount: z.number().optional().describe('Final closed amount (optional if unchanged)'),
      }),
      handler: async (args: { id: string; amount?: number }) => {
        const res = await client.post(`/api/v1/deals/${args.id}/win`, { amount: args.amount })
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_lose_deal',
      description: 'Mark a deal opportunity as LOST with a reason and notes.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Deal UUID'),
        reasonId: z.string().optional().describe('Reason identifier (e.g. PRICE, COMPETITOR, TIMING)'),
        notes: z.string().optional().describe('Explanation or notes on why the deal was lost'),
      }),
      handler: async (args: { id: string; reasonId?: string; notes?: string }) => {
        const res = await client.post(`/api/v1/deals/${args.id}/lose`, { reasonId: args.reasonId, notes: args.notes })
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
