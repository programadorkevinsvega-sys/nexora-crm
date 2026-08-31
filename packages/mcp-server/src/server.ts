import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
  ErrorCode,
  McpError,
} from '@modelcontextprotocol/sdk/types.js'
import { NexoraClient, NexoraClientConfig } from './client/nexora-client'
import { registerContactsTools } from './tools/contacts.tools'
import { registerDealsTools } from './tools/deals.tools'
import { registerInteractionsTools } from './tools/interactions.tools'
import { registerTicketsTools } from './tools/tickets.tools'
import { registerCpqTools } from './tools/cpq.tools'
import { registerAiTools } from './tools/ai.tools'
import { registerKbTools } from './tools/kb.tools'
import { registerNexoraResources } from './resources/nexora-resources'
import { registerNexoraPrompts } from './prompts/nexora-prompts'
import { zodToJsonSchema } from './utils/schema-converter'

export interface NexoraMcpConfig extends NexoraClientConfig {
  readOnly?: boolean
}

const MUTATION_TOOLS = new Set([
  'nexora_create_contact',
  'nexora_create_deal',
  'nexora_move_deal_stage',
  'nexora_win_deal',
  'nexora_lose_deal',
  'nexora_create_note',
  'nexora_create_task',
  'nexora_log_call',
  'nexora_create_ticket',
  'nexora_reply_ticket',
  'nexora_create_quote',
  'nexora_accept_quote',
])

export function createNexoraMcpServer(config: NexoraMcpConfig = {}) {
  const isReadOnly = config.readOnly ?? (process.env.NEXORA_MCP_READONLY === 'true')
  const client = new NexoraClient(config)
  const server = new Server(
    { name: 'nexora-crm-mcp-server', version: '1.0.0' },
    { capabilities: { tools: {}, resources: {}, prompts: {} } },
  )

  const allTools = [
    ...registerContactsTools(client),
    ...registerDealsTools(client),
    ...registerInteractionsTools(client),
    ...registerTicketsTools(client),
    ...registerCpqTools(client),
    ...registerAiTools(client),
    ...registerKbTools(client),
  ]

  // Filter tools if in read-only mode
  const activeTools = isReadOnly ? allTools.filter((t) => !MUTATION_TOOLS.has(t.name)) : allTools
  const resources = registerNexoraResources(client)
  const prompts = registerNexoraPrompts()

  // ── Tools Handlers ────────────────────────────────────
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: activeTools.map((t) => ({
        name: t.name,
        description: t.description,
        inputSchema: zodToJsonSchema(t.inputSchema as any),
      })),
    }
  })

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    if (isReadOnly && MUTATION_TOOLS.has(request.params.name)) {
      throw new McpError(
        ErrorCode.InvalidRequest,
        `Security Guardrail: "${request.params.name}" is blocked because Nexora CRM MCP is running in READ-ONLY mode.`,
      )
    }

    const tool = activeTools.find((t) => t.name === request.params.name)
    if (!tool) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown or unauthorized tool: ${request.params.name}`)
    }

    try {
      const parsedArgs = tool.inputSchema.parse(request.params.arguments || {})
      return await tool.handler(parsedArgs as any)
    } catch (err: any) {
      return {
        isError: true,
        content: [{ type: 'text', text: `Tool Error: ${err?.message || String(err)}` }],
      }
    }
  })

  // ── Resources Handlers ────────────────────────────────
  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    return {
      resources: resources.map((r) => ({
        uri: r.uri,
        name: r.name,
        description: r.description,
        mimeType: r.mimeType,
      })),
    }
  })

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const resource = resources.find((r) => r.uri === request.params.uri)
    if (!resource) {
      throw new McpError(ErrorCode.InvalidRequest, `Unknown resource: ${request.params.uri}`)
    }
    return await resource.handler()
  })

  // ── Prompts Handlers ──────────────────────────────────
  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    return {
      prompts: prompts.map((p) => ({
        name: p.name,
        description: p.description,
        arguments: p.arguments,
      })),
    }
  })

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const prompt = prompts.find((p) => p.name === request.params.name)
    if (!prompt) {
      throw new McpError(ErrorCode.MethodNotFound, `Unknown prompt: ${request.params.name}`)
    }
    return prompt.handler(request.params.arguments as any)
  })

  return { server, client, tools: activeTools, allTools, resources, prompts, isReadOnly }
}
