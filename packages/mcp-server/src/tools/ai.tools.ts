import { z } from 'zod'
import { NexoraClient } from '../client/nexora-client'

export function registerAiTools(client: NexoraClient) {
  return [
    {
      name: 'nexora_predict_deal_win',
      description: 'Predict the closing win probability (%) of a deal based on interactions, CPQ quotes, velocity, and health factors.',
      inputSchema: z.object({
        dealId: z.string().uuid().describe('Deal UUID to analyze'),
      }),
      handler: async (args: { dealId: string }) => {
        const res = await client.get(`/api/v1/ai/deals/${args.dealId}/win-probability`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_generate_message_draft',
      description: 'Generate an AI contextual email or WhatsApp message draft tailored to the contact and deal context.',
      inputSchema: z.object({
        channel: z.enum(['EMAIL', 'WHATSAPP']).describe('Communication channel'),
        tone: z.enum(['FORMAL', 'FRIENDLY', 'PERSUASIVE', 'URGENT', 'CONSULTATIVE']).describe('Tone of the message'),
        objective: z.string().describe('Goal of the message (e.g. Schedule demo, Follow up on quote, Request feedback)'),
        contactId: z.string().uuid().optional().describe('Recipient contact UUID'),
        dealId: z.string().uuid().optional().describe('Associated deal UUID'),
      }),
      handler: async (args: Record<string, unknown>) => {
        const res = await client.post('/api/v1/ai/drafts/generate', args)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_get_contact_summary',
      description: 'Generate an executive 360° AI summary of a contact, including sentiment, key pain points, and recommended strategy.',
      inputSchema: z.object({
        contactId: z.string().uuid().describe('Contact UUID to analyze'),
      }),
      handler: async (args: { contactId: string }) => {
        const res = await client.get(`/api/v1/ai/contacts/${args.contactId}/summary`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexora_predict_churn_risk',
      description: 'Evaluate customer churn risk percentage (0-100%) and retention preventive actions based on ticket sentiment and activity.',
      inputSchema: z.object({
        contactId: z.string().uuid().describe('Contact UUID to evaluate churn risk for'),
      }),
      handler: async (args: { contactId: string }) => {
        const res = await client.get(`/api/v1/ai/contacts/${args.contactId}/churn-risk`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
