import { createNexoraMcpServer } from '../../src/server'
import { zodToJsonSchema } from '../../src/utils/schema-converter'
import { z } from 'zod'

describe('Nexora CRM MCP Server - Unit Tests', () => {
  it('should register all core CRM tools across all modules', () => {
    const { tools } = createNexoraMcpServer({ apiKey: 'test-key' })
    const toolNames = tools.map((t) => t.name)

    expect(toolNames).toContain('nexora_list_contacts')
    expect(toolNames).toContain('nexora_get_contact')
    expect(toolNames).toContain('nexora_create_contact')
    expect(toolNames).toContain('nexora_get_customer_360')
    expect(toolNames).toContain('nexora_list_deals')
    expect(toolNames).toContain('nexora_create_deal')
    expect(toolNames).toContain('nexora_move_deal_stage')
    expect(toolNames).toContain('nexora_win_deal')
    expect(toolNames).toContain('nexora_lose_deal')
    expect(toolNames).toContain('nexora_create_note')
    expect(toolNames).toContain('nexora_create_task')
    expect(toolNames).toContain('nexora_log_call')
    expect(toolNames).toContain('nexora_list_tickets')
    expect(toolNames).toContain('nexora_create_ticket')
    expect(toolNames).toContain('nexora_reply_ticket')
    expect(toolNames).toContain('nexora_list_products')
    expect(toolNames).toContain('nexora_create_quote')
    expect(toolNames).toContain('nexora_accept_quote')
    expect(toolNames).toContain('nexora_predict_deal_win')
    expect(toolNames).toContain('nexora_generate_message_draft')
    expect(toolNames).toContain('nexora_get_contact_summary')
    expect(toolNames).toContain('nexora_predict_churn_risk')
    expect(toolNames).toContain('nexora_search_knowledge_base')
    expect(toolNames).toContain('nexora_get_kb_article')
    expect(tools.length).toBeGreaterThanOrEqual(20)
  })

  it('should enforce READ-ONLY mode when readOnly=true, blocking all mutation tools', () => {
    const { tools, isReadOnly } = createNexoraMcpServer({ readOnly: true })
    expect(isReadOnly).toBe(true)

    const toolNames = tools.map((t) => t.name)
    expect(toolNames).not.toContain('nexora_create_contact')
    expect(toolNames).not.toContain('nexora_create_deal')
    expect(toolNames).not.toContain('nexora_move_deal_stage')
    expect(toolNames).not.toContain('nexora_win_deal')
    expect(toolNames).not.toContain('nexora_lose_deal')
    expect(toolNames).not.toContain('nexora_create_note')
    expect(toolNames).not.toContain('nexora_create_ticket')
    expect(toolNames).toContain('nexora_list_contacts')
    expect(toolNames).toContain('nexora_get_customer_360')
    expect(toolNames).toContain('nexora_list_deals')
    expect(toolNames).toContain('nexora_predict_deal_win')
  })

  it('should register live CRM resources', () => {
    const { resources } = createNexoraMcpServer()
    const uris = resources.map((r) => r.uri)

    expect(uris).toContain('nexora://contacts/recent')
    expect(uris).toContain('nexora://deals/pipeline')
    expect(uris).toContain('nexora://kb/articles')
  })

  it('should register AI prompt workflows', () => {
    const { prompts } = createNexoraMcpServer()
    const promptNames = prompts.map((p) => p.name)

    expect(promptNames).toContain('nexora_deal_review')
    expect(promptNames).toContain('nexora_customer_health_check')

    const dealReview = prompts.find((p) => p.name === 'nexora_deal_review')!
    const result = dealReview.handler({ dealId: '123' } as never)
    expect(result.messages[0].content.text).toContain('deal ID 123')
  })

  it('should execute nexora_get_customer_360 handler calling client.get', async () => {
    const { client, tools } = createNexoraMcpServer()
    jest.spyOn(client, 'get').mockResolvedValue({ contact: { id: 'c-1', firstName: 'Alice' } } as never)

    const tool = tools.find((t) => t.name === 'nexora_get_customer_360')!
    const result = await tool.handler({ contactId: '00000000-0000-0000-0000-000000000001' } as never)

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
    const properties = jsonSchema.properties as Record<string, { type?: string; description?: string; enum?: string[] }>
    expect(jsonSchema.type).toBe('object')
    expect(properties.name.type).toBe('string')
    expect(properties.name.description).toBe('User name')
    expect(properties.role.enum).toEqual(['ADMIN', 'USER'])
    expect(jsonSchema.required).toEqual(['name', 'role'])
  })
})
