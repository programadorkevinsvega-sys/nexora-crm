import { z } from 'zod'
import { NexusClient } from '../client/nexus-client'

export function registerTicketsTools(client: NexusClient) {
  return [
    {
      name: 'nexus_list_tickets',
      description: 'List customer support tickets with optional status or priority filters.',
      inputSchema: z.object({
        status: z.enum(['OPEN', 'PENDING', 'RESOLVED', 'CLOSED']).optional().describe('Ticket status'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().describe('Ticket priority'),
        limit: z.number().min(1).max(100).optional().describe('Max tickets to return'),
      }),
      handler: async (args: { status?: string; priority?: string; limit?: number }) => {
        const queryParams = new URLSearchParams()
        if (args.status) queryParams.set('status', args.status)
        if (args.priority) queryParams.set('priority', args.priority)
        if (args.limit) queryParams.set('limit', String(args.limit))
        const res = await client.get(`/api/v1/tickets?${queryParams.toString()}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_get_ticket',
      description: 'Get details of a support ticket including priority, SLA and messages.',
      inputSchema: z.object({
        id: z.string().uuid().describe('Ticket UUID'),
      }),
      handler: async (args: { id: string }) => {
        const res = await client.get(`/api/v1/tickets/${args.id}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_create_ticket',
      description: 'Create a new support ticket on behalf of a customer.',
      inputSchema: z.object({
        subject: z.string().min(1).describe('Ticket subject or issue summary'),
        description: z.string().min(1).describe('Detailed description of the customer issue'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().describe('Priority level (default MEDIUM)'),
        contactId: z.string().uuid().optional().describe('Contact UUID who reported the ticket'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/tickets', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_reply_ticket',
      description: 'Add a reply message to an existing support ticket.',
      inputSchema: z.object({
        ticketId: z.string().uuid().describe('Ticket UUID'),
        message: z.string().min(1).describe('Response message text for customer'),
      }),
      handler: async (args: { ticketId: string; message: string }) => {
        const res = await client.post(`/api/v1/tickets/${args.ticketId}/reply`, { message: args.message })
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
