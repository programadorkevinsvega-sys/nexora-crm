import { NexusClient } from '../client/nexus-client'

export function registerNexusResources(client: NexusClient) {
  return [
    {
      uri: 'nexus://contacts/recent',
      name: 'Recent Contacts',
      description: 'Live list of active contacts recently updated in Nexus CRM',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/contacts?limit=25')
        return {
          contents: [
            {
              uri: 'nexus://contacts/recent',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
    {
      uri: 'nexus://deals/pipeline',
      name: 'Open Sales Deals',
      description: 'Current open sales opportunities across active pipelines',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/deals?status=OPEN&limit=50')
        return {
          contents: [
            {
              uri: 'nexus://deals/pipeline',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
    {
      uri: 'nexus://kb/articles',
      name: 'Knowledge Base Articles',
      description: 'Index of published help and documentation articles',
      mimeType: 'application/json',
      handler: async () => {
        const data = await client.get('/api/v1/kb/articles')
        return {
          contents: [
            {
              uri: 'nexus://kb/articles',
              mimeType: 'application/json',
              text: JSON.stringify(data, null, 2),
            },
          ],
        }
      },
    },
  ]
}
