import { z } from 'zod'
import { NexoraClient } from '../client/nexora-client'

export function registerContactsTools(client: NexoraClient) {
  return [
    {
      name: 'nexora_list_contacts',
      description: 'List or search contacts in Nexora CRM with optional filters (search term, lead status, limit).',
      inputSchema: z.object({
        search: z.string().optional().describe('Search query matching first name, last name or email'),
        leadStatus: z.string().optional().describe('Filter by status: NEW, CONTACTED, QUALIFIED, UNQUALIFIED, CONVERTED'),
        limit: z.number().min(1).max(100).optional().describe('Number of contacts to return (default 20)'),
      }),
      handler: async (args: { search?: string; leadStatus?: string; limit?: number }) => {
        const queryParams = new URLSearchParams()
        if (args.search) queryParams.set('search', args.search)
        if (args.leadStatus) queryParams.set('leadStatus', args.leadStatus)
        if (args.limit) queryParams.set('limit', String(args.limit))
        const res = await client.get(`/api/v1/contacts?${queryParams.toString()}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_get_contact',
      description: 'Get detailed information for a single contact by their UUID.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Contact UUID'),
      }),
      handler: async (args: { id: string }) => {
        const res = await client.get(`/api/v1/contacts/${args.id}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_create_contact',
      description: 'Create a new commercial contact in Nexora CRM.',
      inputSchema: z.object({
        firstName: z.string().min(1).describe('First name of the contact'),
        lastName: z.string().optional().describe('Last name of the contact'),
        email: z.string().email().optional().describe('Primary email address'),
        phone: z.string().optional().describe('Phone number with country code'),
        jobTitle: z.string().optional().describe('Job title or position'),
        companyId: z.string().uuid().optional().describe('Associated company UUID'),
        leadStatus: z.enum(['NEW', 'CONTACTED', 'QUALIFIED', 'UNQUALIFIED', 'CONVERTED']).optional().describe('Initial lead status'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/contacts', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_get_customer_360',
      description: 'Retrieve the complete Customer 360° profile including active deals, CPQ quotes, support tickets, and recent omnichannel interactions.',
      inputSchema: z.object({
        contactId: z.string().uuid().describe('Contact UUID to aggregate 360 profile for'),
      }),
      handler: async (args: { contactId: string }) => {
        const res = await client.get(`/api/v1/contacts/${args.contactId}/360`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
