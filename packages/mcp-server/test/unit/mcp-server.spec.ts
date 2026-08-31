import { createNexusMcpServer } from '../../src/server'
import { zodToJsonSchema } from '../../src/utils/schema-converter'
import { z } from 'zod'

describe('Nexus CRM MCP Server - Unit Tests', () => {
  it('should register all core CRM tools across all modules', () => {
    const { tools } = createNexusMcpServer({ apiKey: 'test-key' })

    const toolNames = tools.map((t) => t.name)

    // Contacts & 360
    expect(toolNames).toContain('nexus_list_contacts')
    expect(toolNames).toContain('nexus_get_contact')
    expect(toolNames).toContain('nexus_create_contact')
    expect(toolNames).toContain('nexus_get_customer_360')

    // Deals & Pipeline
    expect(toolNames).toContain('nexus_list_deals')
    expect(toolNames).toContain('nexus_create_deal')
    expect(toolNames).toContain('nexus_move_deal_stage')
    expect(toolNames).toContain('nexus_win_deal')
    expect(toolNames).toContain('nexus_lose_deal')

    // Interactions
    expect(toolNames).toContain('nexus_create_note')
    expect(toolNames).toContain('nexus_create_task')
    expect(toolNames).toContain('nexus_log_call')

    // Support Tickets
    expect(toolNames).toContain('nexus_list_tickets')
    expect(toolNames).toContain('nexus_create_ticket')
    expect(toolNames).toContain('nexus_reply_ticket')

    // CPQ & Quotes
    expect(toolNames).toContain('nexus_list_products')
    expect(toolNames).toContain('nexus_create_quote')
    expect(toolNames).toContain('nexus_accept_quote')

    // AI Intelligence
    expect(toolNames).toContain('nexus_predict_deal_win')
    expect(toolNames).toContain('nexus_generate_message_draft')
    expect(toolNames).toContain('nexus_get_contact_summary')
    expect(toolNames).toContain('nexus_predict_churn_risk')

    // Knowledge Base
    expect(toolNames).toContain('nexus_search_knowledge_base')
    expect(toolNames).toContain('nexus_get_kb_article')

    expect(tools.length).toBeGreaterThanOrEqual(20)
  })

  it('should enforce READ-ONLY mode when readOnly=true, blocking all mutation tools', () => {
    const { tools, isReadOnly } = createNexusMcpServer({ readOnly: true })
    expect(isReadOnly).toBe(true)

    const toolNames = tools.map((t) => t.name)
    expect(toolNames).not.toContain('nexus_create_contact')
    expect(toolNames).not.toContain('nexus_create_deal')
    expect(toolNames).not.toContain('nexus_move_deal_stage')
    expect(toolNames).not.toContain('nexus_win_deal')
    expect(toolNames).not.toContain('nexus_lose_deal')
    expect(toolNames).not.toContain('nexus_create_note')
    expect(toolNames).not.toContain('nexus_create_ticket')

    // Read tools must remain available
    expect(toolNames).toContain('nexus_list_contacts')
    expect(toolNames).toContain('nexus_get_customer_360')
    expect(toolNames).toContain('nexus_list_deals')
    expect(toolNames).toContain('nexus_predict_deal_win')
  })

  it('should register live CRM resources', () => {
    const { resources } = createNexusMcpServer()
    const uris = resources.map((r) => r.uri)

    expect(uris).toContain('nexus://contacts/recent')
    expect(uris).toContain('nexus://deals/pipeline')
    expect(uris).toContain('nexus://kb/articles')
  })

  it('should register AI prompt workflows', () => {
    const { prompts } = createNexusMcpServer()
    const promptNames = prompts.map((p) => p.name)

    expect(promptNames).toContain('nexus_deal_review')
    expect(promptNames).toContain('nexus_customer_health_check')

    const dealReview = prompts.find((p) => p.name === 'nexus_deal_review')!
    const res = (dealReview.handler as any)({ dealId: '123' })
    expect(res.messages[0].content.text).toContain('deal ID 123')
  })

  it('should execute nexus_get_customer_360 handler calling client.get', async () => {
    const { client, tools } = createNexusMcpServer()
    jest.spyOn(client, 'get').mockResolvedValue({ contact: { id: 'c-1', firstName: 'Alice' } } as any)

    const tool = tools.find((t) => t.name === 'nexus_get_customer_360')!
    const result = await (tool.handler as any)({ contactId: '00000000-0000-0000-0000-000000000001' })

    expect(result.content[0].text).toContain('Alice')
    expect(client.get).toHaveBeenCalledWith('/api/v1/contacts/00000000-0000-0000-0000-000000000001/360')
  })

  it('zodToJsonSchema should properly convert Zod objects', () => {
    const schema = z.object({
      name: z.string().describe('User name'),
      age: z.number().optional(),
      role: z.enum(['ADMIN', 'USER']),
    })

    const jsonSchema = zodToJsonSchema(schema)
    expect(jsonSchema.type).toBe('object')
    expect((jsonSchema.properties as any).name.type).toBe('string')
    expect((jsonSchema.properties as any).name.description).toBe('User name')
    expect((jsonSchema.properties as any).role.enum).toEqual(['ADMIN', 'USER'])
    expect(jsonSchema.required).toEqual(['name', 'role'])
  })
})
