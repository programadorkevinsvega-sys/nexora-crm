#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { config } from 'dotenv'
import { createNexusMcpServer } from './server'

config()

async function main() {
  const { server } = createNexusMcpServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
  console.error('🚀 Nexus CRM MCP Server running on stdio transport')
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal MCP Server error:', err)
    process.exit(1)
  })
}

export { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
export * from './server'
export * from './client/nexus-client'
