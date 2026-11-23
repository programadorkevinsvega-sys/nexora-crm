#!/usr/bin/env node
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { config } from 'dotenv'
import { createNexoraMcpServer } from './server'

config()

async function main() {
  const { server } = createNexoraMcpServer()
  const transport = new StdioServerTransport()

  await server.connect(transport)
  process.stderr.write('🚀 Nexora CRM MCP Server running on stdio transport\\n')
}

if (require.main === module) {
  main().catch((err) => {
    console.error('Fatal MCP Server error:', err)
    process.exit(1)
  })
}

export { SSEServerTransport } from '@modelcontextprotocol/sdk/server/sse.js'
export * from './server'
export * from './client/nexora-client'
