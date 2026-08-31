import { z } from 'zod'
import { NexusClient } from '../client/nexus-client'

export function registerInteractionsTools(client: NexusClient) {
  return [
    {
      name: 'nexus_create_note',
      description: 'Create and attach an internal note to a contact, deal, or company.',
      inputSchema: z.object({
        content: z.string().min(1).describe('Note markdown or plain text content'),
        contactId: z.string().uuid().optional().describe('Contact UUID to attach note to'),
        dealId: z.string().uuid().optional().describe('Deal UUID to attach note to'),
        companyId: z.string().uuid().optional().describe('Company UUID to attach note to'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/notes', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_create_task',
      description: 'Create a commercial task or follow-up reminder.',
      inputSchema: z.object({
        title: z.string().min(1).describe('Task title'),
        description: z.string().optional().describe('Task details'),
        dueDate: z.string().describe('Due date in ISO or YYYY-MM-DD format'),
        priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional().describe('Task priority'),
        contactId: z.string().uuid().optional().describe('Associated contact UUID'),
        dealId: z.string().uuid().optional().describe('Associated deal UUID'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/tasks', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_log_call',
      description: 'Log an outbound or inbound phone call interaction with duration and outcome.',
      inputSchema: z.object({
        contactId: z.string().uuid().describe('Contact UUID'),
        durationSeconds: z.number().min(0).describe('Duration of the call in seconds'),
        outcome: z.string().describe('Outcome of call (e.g. CONNECTED, BUSY, NO_ANSWER, LEFT_VOICEMAIL)'),
        notes: z.string().optional().describe('Notes discussed during the call'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/calls', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
