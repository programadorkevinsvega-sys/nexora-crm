import { NexoraClient } from '../client/nexora-client'

export function registerNexoraResources(client: NexoraClient) {
  return [
    {
      uri: 'nexora://contacts/recent',
      name: 'Recent Contacts',
      description: 'Live list of active contacts recently updated in Nexora CRM',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/contacts?limit=25')
        return {
          contents: [
            {
              uri: 'nexora://contacts/recent',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
    {
      uri: 'nexora://deals/pipeline',
      name: 'Open Sales Deals',
      description: 'Current open sales opportunities across active pipelines',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/deals?status=OPEN&limit=50')
        return {
          contents: [
            {
              uri: 'nexora://deals/pipeline',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
    {
      uri: 'nexora://kb/articles',
      name: 'Knowledge Base Articles',
      description: 'Index of published help and documentation articles',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/kb/articles')
        return {
          contents: [
            {
              uri: 'nexora://kb/articles',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
  ]
}
