import { z } from 'zod'
import { NexusClient } from '../client/nexus-client'

export function registerKbTools(client: NexusClient) {
  return [
    {
      name: 'nexus_search_knowledge_base',
      description: 'Search public knowledge base articles for help, troubleshooting, or product FAQs.',
      inputSchema: z.object({
        search: z.string().optional().describe('Search keyword or topic query'),
        categoryId: z.string().uuid().optional().describe('Category UUID filter'),
      }),
      handler: async (args: { search?: string; categoryId?: string }) => {
        const queryParams = new URLSearchParams()
        if (args.search) queryParams.set('search', args.search)
        if (args.categoryId) queryParams.set('categoryId', args.categoryId)
        const res = await client.get(`/api/v1/kb/articles?${queryParams.toString()}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
    {
      name: 'nexus_get_kb_article',
      description: 'Retrieve full article content in Markdown format by article UUID or slug.',
      inputSchema: z.object({
        idOrSlug: z.string().min(1).describe('Article UUID or slug'),
      }),
      handler: async (args: { idOrSlug: string }) => {
        const res = await client.get(`/api/v1/kb/articles/${args.idOrSlug}`)
        return { content: [{ type: 'text', text: JSON.stringify(res, null, 2) }] }
      },
    },
  ]
}
