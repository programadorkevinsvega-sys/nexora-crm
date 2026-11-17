import { z } from 'zod'
import { NexoraClient } from '../client/nexora-client'

export function registerCpqTools(client: NexoraClient) {
  return [
    {
      name: 'nexora_list_products',
      description: 'Query product catalog, price lists, SKU codes, and descriptions in the CRM.',
      inputSchema: z.object({}),
      handler: async () => {
        const res = await client.get('/api/v1/products')
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_get_quote',
      description: 'Get quote details including line items, discounts, taxes, and grand total.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Quote UUID'),
      }),
      handler: async (args: { id: string }) => {
        const res = await client.get(`/api/v1/quotes/${args.id}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_create_quote',
      description: 'Generate a new CPQ quote with valid period and terms.',
      inputSchema: z.object({
        quoteNumber: z.string().min(1).describe('Unique quote code/number (e.g. Q-2026-001)'),
        validUntil: z.string().describe('Validity expiration date (YYYY-MM-DD)'),
        dealId: z.string().uuid().optional().describe('Associated deal UUID'),
        termsAndConditions: z.string().optional().describe('Terms and conditions text'),
        subtotal: z.number().optional().describe('Subtotal amount'),
        taxTotal: z.number().optional().describe('Tax amount'),
        grandTotal: z.number().optional().describe('Total quote amount'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/quotes', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_accept_quote',
      description: 'Accept a formal CPQ quote to advance deal or initiate contracting.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Quote UUID'),
      }),
      handler: async (args: { id: string }) => {
        const res = await client.post(`/api/v1/quotes/${args.id}/accept`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
